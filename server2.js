var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(8080);

function handler(req, res) {
  fs.readFile(__dirname + '/index2.html', function(err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index2.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function(socket) {
  socket.broadcast.emit('notify', { message : '欢迎“' + socket.id + "”进入了聊天室" });

  socket.on('sendMessage', function(data) {
    console.log(data);
    data.nickname = socket.store.data.nickname;
    socket.broadcast.emit('newMessage', data); // 给公众发消息
    socket.emit('newMessage', data); // 给自己发消息
  });

  socket.on('setNickname', function(data){
    var _nickname = socket.store.data.nickname;
    socket.set('nickname', data.nickname, function(){
      socket.broadcast.emit('notify', { message : '“' + _nickname + '”' + '更名为：“' + data.nickname + '”' });
    });
  });

  socket.on('disconnect', function(){
    socket.broadcast.emit('notify', { message : '“' + socket.store.data.nickname + "”离开了聊天室" });
  });
});