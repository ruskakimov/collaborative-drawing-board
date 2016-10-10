var express = require('express');

var app = express();
var server = app.listen(8080);
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

    socket.on('startpath', function (data) {
        socket.lineID = lines.length;
        lines.push({
          color: data.color,
          width: data.width,
          points: [data.pos]
        });
        socket.broadcast.emit('start', data);
    });

    socket.on('drawing', function (pos) {
        lines[socket.lineID].points.push(pos);
        socket.broadcast.emit('draw', pos);
      }
    );

    socket.on('endpath', function (pos) {
        lines[socket.lineID].points.push(pos);
        console.log(lines);
        socket.broadcast.emit('end', pos);
    });

    socket.on('disconnect', function () {
      console.log(socket.id + " has disconnected.");
    });
  }
);
