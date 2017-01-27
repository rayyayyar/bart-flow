console.log("Start");
var c = document.getElementById("canvas");
c.width = 800;
c.height = 800;
var ctx = c.getContext("2d");

var startX = 0;
var startY = 0;
var endX = 500;
var endY = 250;
var p = 333;
var y = 120;
var coordinates = {
  "red": {
    "stationPos": [
      [333, 120],
      [344, 142],
      [355, 164],
      [367, 187],
      [378, 209],
      [391, 234],
      [387, 269],
      [384, 292],
      [381, 318],
      [248, 318],
      [230, 347],
      [128, 523],
      [227, 669]
    ]
  }
}

function drawLine() {  
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(333, 120);
  
  if (p < endX) {
    ctx.lineTo(p, y);
  }
  else {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    p = 333;
    y = 120;
  }
  ctx.stroke();
  p++;
  y++;
  requestAnimationFrame(drawLine);
  
}

drawLine();