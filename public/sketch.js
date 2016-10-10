APP = {};

APP.setup = function () {
  APP.canvas = document.getElementById('board');
  APP.ctx = APP.canvas.getContext('2d');
  APP.canvas.width = 500;
  APP.canvas.height = 500;
  APP.tool = new Pencil(true);
  APP.shadowTool = new Pencil(false);
  APP.socket = io.connect('http://localhost:8080');
  APP.lines = [];

  APP.socket.on('history', function (data) {
    console.log("Received history: " + data);
    APP.lines = data.lines;
    APP.shadowTool.draw();
  });

  APP.socket.on('start', function (data) {
    console.log("Started path at: " + data.pos.x + " " + data.pos.y);
    APP.shadowTool.color = data.color;
    APP.shadowTool.width = data.width;
    APP.shadowTool.mousedown(data.pos);
  });

  APP.socket.on('draw', function (pos) {
    console.log("Drawing at: " + pos.x + " " + pos.y);
    APP.shadowTool.mousemove(pos);
  });

  APP.socket.on('end', function (pos) {
    console.log("Ended path at: " + pos.x + " " + pos.y);
    APP.shadowTool.mouseup(pos);
  });
}

function Pencil (client) {
  this.drawing = false;
  this.color = "#55F";
  this.width = 5;
  APP.ctx.lineCap = 'round';
  APP.ctx.lineJoin = 'round';
  this.client = client;

  this.draw = function () {
    var lines, points;
    lines = APP.lines;
    for (var i = 0; i < lines.length; i++) {
      points = lines[i].points;
      APP.ctx.strokeStyle = lines[i].color;
      APP.ctx.lineWidth = lines[i].width;
      APP.ctx.beginPath();
      APP.ctx.moveTo(points[0].x, points[0].y);
      for (var j = 1; j < points.length; j++) {
        APP.ctx.lineTo(points[j].x, points[j].y);
      }
      APP.ctx.stroke();
    }
  };

  this.mousedown = function (pos) {
    this.drawing = true;
    APP.ctx.strokeStyle = this.color;
    APP.ctx.lineWidth = this.width;
    APP.ctx.beginPath();
    APP.ctx.moveTo(pos.x, pos.y)
    if (client) {
      APP.socket.emit('startpath', {
        color: this.color,
        width: this.width,
        pos: pos
      });
    }
  };
  this.mousemove = function (pos) {
    if (this.drawing) {
      APP.ctx.lineTo(pos.x, pos.y);
      APP.ctx.stroke();
      if (client) {
        APP.socket.emit('drawing', pos);
      }
    }
  };
  this.mouseup = function (pos) {
    if (this.drawing) {
      this.drawing = false;
      if (client) {
        APP.socket.emit('endpath', pos);
      }
    }
  };
  this.mouseout = function (pos) {
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
    APP.tool[e.type](pos);
  } catch (e) {
    console.log(e);
  }
};

APP.setup();
APP.canvas.addEventListener('mousedown', APP.eventHandler);
APP.canvas.addEventListener('mousemove', APP.eventHandler);
APP.canvas.addEventListener('mouseup', APP.eventHandler);
APP.canvas.addEventListener('mouseout', APP.eventHandler);
