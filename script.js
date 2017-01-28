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
var trains = [{
  "red": [
      {
        "station": "Richmond", 
        "x": 333, 
        "y": 120 
      },
      {
        "station": "El Cerrito Del Norte", 
        "x": 344, 
        "y": 142 
      },
      {
        "station": "El Cerrito Plaza", 
        "x": 356, 
        "y": 164 
      },
      {
        "station": "North Berkeley", 
        "x": 367, 
        "y": 187 
      },
      {
        "station": "Downtown Berkeley", 
        "x": 378, 
        "y": 209 
      },
      {
        "station": "Ashby", 
        "x": 391, 
        "y": 234 
      },
      {
        "station": "MacArthur", 
        "x": 387, 
        "y": 269 
      },
      {
        "station": "19th St", 
        "x": 384, 
        "y": 291 
      },
      {
        "station": "12th St", 
        "x": 381, 
        "y": 318 
      },
      {
        "station": "West Oakland", 
        "x": 351, 
        "y": 318 
      },
      {
        "station": "Embarcadero", 
        "x": 230, 
        "y": 347 
      },
      {
        "station": "Montgomery",
        "x": 219,
        "y": 366 
      },
      {
        "station": "Powell", 
        "x": 208, 
        "y": 385 
      },
      {
        "station": "Civic Center", 
        "x": 197, 
        "y": 404 
      },
      {
        "station": "16th St", 
        "x": 184, 
        "y": 424 
      },
      {
        "station": "24th St", 
        "x": 172, 
        "y": 445 
      },
      {
        "station": "Glen Park", 
        "x": 162, 
        "y": 462 
      },
      {
        "station": "Balboa Park", 
        "x": 152, 
        "y": 479 
      },
      {
        "station": "Daly City", 
        "x": 142, 
        "y": 497 
      },
      {
        "station": "Colma", 
        "x": 147, 
        "y": 554 
      },
      {
        "station": "South San Francisco", 
        "x": 171, 
        "y": 590 
      },
      {
        "station": "San Bruno", 
        "x": 195, 
        "y": 623 
      },
      {
        "station": "Millbrae", 
        "x": 227, 
        "y": 669 
      }
    ]
}];

for (var i = 0; i < trains.length; i++) {
  var t = trains[i];
  for (var x = 0; x < t.red.length; x++) {
    console.log(t.red[x].station, t.red[x].x, t.red[x].y);
  }
}

function draw() {  
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(333, 120);
  // moveTo coordinates.red.stationPos[0];
  // draw to coordinates.red.stationPos[1], pause, endPath, then draw to [2], etc
  // until .last
  // what about multiple trains?

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
  requestAnimationFrame(draw);
  
}



draw();