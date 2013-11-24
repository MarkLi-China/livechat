
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var sio = require('socket.io');
var Unit = require('./models/unit');

var app = express();
var server = http.createServer(app);
var io = sio.listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/service', routes.service);
app.get('/users', user.list);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// clients connection
var conns = {};
// rooms
var roomNum = 0;
var waitingRooms = {};
var workingRooms = {};
// clients-to-services
var cts = {};

var client = io.of('/client').on('connection', function(socket) {
  var cid = socket.id;
  conns[cid] = socket;
  // join in room OR waiting
  if (Unit.isEmpty(waitingRooms)) {
    socket.emit('system', { msg: 'Busy! Please wait for a moment!'});
  } else {
    delete conns[cid];
    for (var sid in waitingRooms) {
      socket.room = waitingRooms[sid]['room'];
      socket.join(socket.room);
      cts[cid] = sid;
      workingRooms[sid] = waitingRooms[sid];
      delete waitingRooms[sid];
      break;
    }
    socket.emit('system', { msg: 'Welcome to ' + socket.room + '!' });
  }

  socket.on('message', function(message) {
    message.name = 'client';
    socket.emit('message', message);
    service.in(socket.room).emit('message', message);
  });

  socket.on('disconnect', function() {
    // leave room OR quit
    if (Unit.isEmpty(conns[cid])) {
      socket.leave(socket.room);
      var sid = cts[cid];
      waitingRooms[sid] = workingRooms[sid];
      delete workingRooms[sid];
      service.in(socket.room).emit('system', { msg: cid + ' leaved.' });
    } else {
      delete conns[cid];
    }
  });
});

var service = io.of('/service').on('connection', function(socket) {
  var sid = socket.id;
  // create room
  roomNum++;
  socket.room = 'room-'+roomNum;
  socket.join(socket.room);
  waitingRooms[sid] = { room: socket.room };
  socket.emit('system', { msg: socket.room + ' has been created.' });

  socket.on('message', function(message) {
    message.name = 'service';
    socket.emit('message', message);
    client.in(socket.room).emit('message', message);
  });

  socket.on('disconnect', function() {
    // delete room
    socket.leave(socket.room);
    delete waitingRooms[sid];
    client.in(socket.room).emit('system', { msg: 'Something is wrong with the service.' })
  });
});