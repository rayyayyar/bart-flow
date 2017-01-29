console.log('sratch.js');
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 800;
var context = canvas.getContext('2d');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;
var radius = 90;
var endPercent = 85;
var tX = 200;
var tY = 200;
var quart = -(Math.PI * 2) + 1;
var startTime = null;
var duration = 3000;

function animate(time) {
  if (!startTime) {
    startTime = time;
  }
  var timeElapsed = time - startTime;
  var delta = Math.min(1, timeElapsed / duration);
  // var curPerc = ((-2 * Math.PI) / 100) * (endPercent * delta);
  // var curX = tX * delta;
  // var curY = tY * delta;

  // context.clearRect(0, 0, canvas.width, canvas.height);
  // context.beginPath();
  // context.arc(centerX, centerY, radius, -quart, curPerc - quart, true);
  // context.moveTo(0,0);
  // context.lineTo(curX, curY);


  // context.stroke();
  console.log(time);

  if (delta < 1) {
    requestAnimationFrame(animate);
  } else {
    startTime = null;
  }
}

var startAnim = function() {
  context.lineWidth = 3;
  context.strokeStyle = '#000';
  requestAnimationFrame(animate);
};
startAnim();
