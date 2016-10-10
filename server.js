var express = require('express');

var app = express();
var server = app.listen(8080);
app.use(express.static('public'));

var io = require('socket.io')(server);

io.sockets.on('connection',
  function (socket) {
    console.log("New client: " + socket.id);

    socket.on('startpath', function (data) {
        console.log("Started drawing at :" + data.x + " " + data.y);
        socket.broadcast.emit('start', data);
    });

    socket.on('drawing', function (data) {
        console.log("Received drawing at :" + data.x + " " + data.y);
        socket.broadcast.emit('draw', data);
      }
    );

    socket.on('endpath', function (data) {
        console.log("Ended drawing at :" + data.x + " " + data.y);
        socket.broadcast.emit('end', data);
    });

    socket.on('disconnect', function () {
      console.log(socket.id + " has disconnected.");
    });
  }
);
