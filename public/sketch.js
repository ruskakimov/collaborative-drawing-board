APP = {};
APP.canvas = document.getElementById('board');
APP.ctx = APP.canvas.getContext('2d');

APP.canvas.width = 500;
APP.canvas.height = 500;
APP.tool = new Pencil();

function Pencil (e) {
  this.drawing = false;
  this.color = "#55F";
  this.width = 5;

  this.mousedown = function (e, pos) {
    this.drawing = true;
    APP.ctx.beginPath();
    APP.ctx.strokeStyle = this.color;
    APP.ctx.lineWidth = this.width;
    APP.ctx.moveTo(pos.x, pos.y)
  };
  this.mousemove = function (e, pos) {
    if (this.drawing) {
      APP.ctx.lineTo(pos.x, pos.y);
      APP.ctx.stroke();
    }
  };
  this.mouseup = function (e, pos) {
    if (this.drawing) {
      this.drawing = false;
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
    APP.tool[e.type](e, pos);
  } catch (e) {
    console.log(e);
  }
};

APP.canvas.addEventListener('mousedown', APP.eventHandler);
APP.canvas.addEventListener('mousemove', APP.eventHandler);
APP.canvas.addEventListener('mouseup', APP.eventHandler);
