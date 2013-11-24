var conns = new Array();

var ws = require('websocket-server');

var server = ws.createServer();

server.addListener('connection', function(conn) {
  console.log('connecting....');

  conns.push(conn);

  conn.addListener('message', function(msg) {
    console.log(msg);

    for (var i=0; i<conns.length; i++) {
      if (conns[i] != conn) {
        conns[i].send(msg);
      };
    }
  });
});

server.listen(8002);
console.log('Server started at port @8002');