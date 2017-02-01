console.log("Start");
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
c.width = 800;
c.height = 800;
ctx.strokeStyle = 'red';
ctx.lineWidth = 3;
ctx.lineCap="round";
import coordinates from "./trains.js";

var redLine = coordinates[0].red;
console.log("redLine:" + redLine);
ctx.moveTo(redLine[0].x, redLine[0].y);

var s = 0;
var duration = 1000;
var startTime = null;

function animate(time) {
	console.log("redline:" + redLine[s].station);
	console.log(time);
  if (!startTime) {
    startTime = time;
  }
  var timeElapsed = time - startTime;
  var delta = Math.min(1, timeElapsed / duration);
  console.log("delta:" + delta);
  console.log("redLine[s+1].x: " + redLine[s+1].x);
  var dX = (redLine[s+1].x - redLine[s].x) * delta;
  var dY = (redLine[s+1].y - redLine[s].y) * delta;
  // TODO: round delta to nearest pixel integer
  console.log("dX, dY: " + dX + "," + dY);
  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(Math.round(redLine[s].x), Math.round(redLine[s].y));
  ctx.lineTo(Math.round(redLine[s].x + dX), Math.round(redLine[s].y + dY));
  ctx.stroke();
	
	if (delta < 1) {
    requestAnimationFrame(animate);    
  } else {
    startTime = null;
    s++;
    setTimeout(function(){ startAnim() });
  }
}

var startAnim = function() {
  requestAnimationFrame(animate);

};

startAnim();
