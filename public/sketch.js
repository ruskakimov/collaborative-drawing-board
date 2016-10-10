APP = {};
APP.canvas = document.getElementById('board');
APP.ctx = APP.canvas.getContext('2d');

APP.setup = function () {
  APP.canvas.width = 500;
  APP.canvas.height = 500;
  APP.tool = new Pencil();
  APP.socket = io.connect('http://localhost:8080');

  APP.socket.on('start', function (data) {
    console.log("Started path at: " + data.x + " " + data.y);
    APP.tool.mousedown(data, false);
  });

  APP.socket.on('draw', function (data) {
    console.log("Drawing at: " + data.x + " " + data.y);
    APP.tool.mousemove(data, false);
  });

  APP.socket.on('end', function (data) {
    console.log("Ended path at: " + data.x + " " + data.y);
    APP.tool.mouseup(data, false);
  });
}

function Pencil (e) {
  this.drawing = false;
  this.clientColor = "#55F";
  this.secondColor = "#F55";
  this.width = 5;
  APP.ctx.lineCap = 'round';
  APP.ctx.lineJoin = 'round';

  this.mousedown = function (pos, client) {
    this.drawing = true;
    if (client) {
      APP.ctx.strokeStyle = this.clientColor;
      APP.socket.emit('startpath', pos);
    } else {
      APP.ctx.strokeStyle = this.secondColor;
    }
    APP.ctx.lineWidth = this.width;
    APP.ctx.beginPath();
    APP.ctx.moveTo(pos.x, pos.y)
  };
  this.mousemove = function (pos, client) {
    if (this.drawing) {
      APP.ctx.lineTo(pos.x, pos.y);
      APP.ctx.stroke();
      if (client) {
        APP.socket.emit('drawing', pos);
      }
    }
  };
  this.mouseup = function (pos, client) {
    if (this.drawing) {
      this.drawing = false;
      if (client) {
        APP.socket.emit('endpath', pos);
      }
    }
  };
  this.mouseout = function (pos, client) {
    if (this.drawing) {
      this.drawing = false;
      if (client) {
        APP.socket.emit('endpath', pos);
      }
    }
  };
}

APP.getMousePosition = function (canvas, e) {
  var rect = this.canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

APP.eventHandler = function (e) {
  var pos = APP.getMousePosition(this.canvas, e);
  try {
    APP.tool[e.type](pos, true);
  } catch (e) {
    console.log(e);
  }
};

APP.setup();
APP.canvas.addEventListener('mousedown', APP.eventHandler);
APP.canvas.addEventListener('mousemove', APP.eventHandler);
APP.canvas.addEventListener('mouseup', APP.eventHandler);
APP.canvas.addEventListener('mouseout', APP.eventHandler);
