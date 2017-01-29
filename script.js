console.log("Start");
var c = document.getElementById("canvas");
c.width = 800;
c.height = 800;
var ctx = c.getContext("2d");
ctx.strokeStyle = 'red';
ctx.lineWidth = 2;

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

var redLine = trains[0].red;
console.log("redLine:" + redLine);
ctx.moveTo(redLine[0].x, redLine[0].y);

/*
 - Set initial departure point: moveTo first coordinate in redLine's array.
 - Draw a line from that point to the next coordinate.
 - Draw another a line from that coordinate to the next coordinate.
 - Continue until there are no more coordinates left in trainline's array.
 - How to parallelize this for multiple train lines?

*/

var s = 0;
var duration = 2000;
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
  console.log("dX, dY: " + dX + "," + dY);
  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(redLine[s].x, redLine[s].y);
  ctx.lineTo(redLine[s].x + dX, redLine[s].y + dY);
  ctx.stroke();
	
	if (delta < 1) {
    requestAnimationFrame(animate);
  } else {
  	console.log('delta > 1');
    startTime = null;
    s++;
    startAnim();
  }
}

var startAnim = function() {
  requestAnimationFrame(animate);

};

startAnim();
