APP = {};

APP.setup = function () {
  APP.canvas = document.getElementById('board');
  APP.ctx = APP.canvas.getContext('2d');
  APP.canvas.width = window.innerWidth;
  APP.canvas.height = window.innerHeight;
  APP.tool = new Pencil(true);
  APP.shadowTool = new Pencil(false);
  APP.socket = io.connect(window.location.hostname);
  APP.lines = [];

//dat.gui
  APP.gui = new dat.GUI();
  APP.gui.add(APP.tool, 'width', 1, 100).step(1);
  APP.gui.addColor(APP.tool, 'color');
  APP.gui.add(APP, 'clear');

  APP.socket.on('history', function (data) {
    // console.log("Received history: " + data);
    APP.lines = data.lines;
    APP.shadowTool.draw();
  });

  APP.socket.on('start', function (data) {
    // console.log("Started path at: " + data.points[0].x + " " + data.points[0].y);
    APP.shadowTool.color = data.color;
    APP.shadowTool.width = data.width;
    APP.shadowTool.mousedown(data.points[0]);
  });

  APP.socket.on('draw', function (pos) {
    // console.log("Drawing at: " + pos.x + " " + pos.y);
    APP.shadowTool.mousemove(pos);
  });

  APP.socket.on('end', function (pos) {
    // console.log("Ended path at: " + pos.x + " " + pos.y);
    APP.shadowTool.mouseup(pos);
  });

  APP.socket.on('clear', function () {
    APP.lines = [];
    APP.ctx.clearRect(0, 0, APP.canvas.width, APP.canvas.height);
    // console.log("Clear received!");
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
    var line = {
      color: this.color,
      width: this.width,
      points: [pos]
    };
    this.lineId = APP.lines.length;
    APP.lines.push(line);
    if (client) {
      APP.socket.emit('startpath', line);
    }
  };
  this.mousemove = function (pos) {
    if (this.drawing) {
      APP.lines[this.lineId].points.push(pos);
      APP.ctx.clearRect(0, 0, APP.canvas.width, APP.canvas.height);
      this.draw();
      if (client) {
        APP.socket.emit('drawing', pos);
      }
    }
  };
  this.mouseup = function (pos) {
    if (this.drawing) {
      APP.lines[this.lineId].points.push(pos);
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

APP.clear = function () {
  APP.lines = [];
  APP.ctx.clearRect(0, 0, APP.canvas.width, APP.canvas.height);
  APP.socket.emit('clear');
};

APP.getMousePosition = function (e) {
  var rect = this.canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

APP.mouseHandler = function (e) {
  var pos = APP.getMousePosition(e);
  try {
    APP.tool[e.type](pos);
  } catch (e) {
    console.log(e);
  }
};

APP.touchHandler = function (e) {
  if (e.touches.length == 1) {
    e.preventDefault();
    var touch = e.targetTouches[0];
    var pos = {
      x: touch.pageX,
      y: touch.pageY
    };
    switch (e.type) {
      case 'touchstart':
        APP.tool.mousedown(pos);
        break;
      case 'touchmove':
        APP.tool.mousemove(pos);
        break;
      case 'touchend':
        APP.tool.mouseup(pos);
        break;
    }
  }
};

APP.setup();
APP.canvas.addEventListener('mousedown', APP.mouseHandler);
APP.canvas.addEventListener('mousemove', APP.mouseHandler);
APP.canvas.addEventListener('mouseup', APP.mouseHandler);
APP.canvas.addEventListener('mouseout', APP.mouseHandler);
APP.canvas.addEventListener('touchstart', APP.touchHandler);
APP.canvas.addEventListener('touchmove', APP.touchHandler);
APP.canvas.addEventListener('touchend', APP.touchHandler);
