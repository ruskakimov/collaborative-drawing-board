var canvas = document.getElementById('board');
var ctx = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

function drawCircle(context, x, y, radius) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2*Math.PI);
  context.fill();
}

var draw = function () {
  ctx.fillStyle = "#FFF";
  drawCircle(ctx, canvas.width/2, canvas.height/2, 20);
};

canvas.addEventListener('click', draw);
