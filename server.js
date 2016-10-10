var express = require('express');

var app = express();
var server = app.listen(process.env.PORT || 8080);
app.use(express.static('public'));

var io = require('socket.io')(server);

var lines = [];

io.sockets.on('connection',
  function (socket) {
    console.log("New client: " + socket.id);
    socket.emit('history',
    {
      lines: lines
    });

    socket.on('startpath', function (line) {
        socket.lineID = lines.length;
        lines.push(line);
        socket.broadcast.emit('start', line);
    });

    socket.on('drawing', function (pos) {
        lines[socket.lineID].points.push(pos);
        socket.broadcast.emit('draw', pos);
      }
    );

    socket.on('endpath', function (pos) {
        lines[socket.lineID].points.push(pos);
        socket.broadcast.emit('end', pos);
    });

    socket.on('clear', function () {
      lines = [];
      socket.broadcast.emit('clear');
    });

    socket.on('disconnect', function () {
      console.log(socket.id + " has disconnected.");
    });
  }
);
