console.log("Start");
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
c.width = 800;
c.height = 800;
ctx.strokeStyle = 'red';
ctx.lineWidth = 1;
ctx.lineCap="round";
import coordinates from "./trains.js";
var riders = require("./data/riders.json");
var trainLoad = 1;

// function showRiders(json) {
//   console.log("showRiders()");
//   var riders = json;
//   for (var i = 0; i < riders.length; i++) {
//     console.log("From " + riders[i].origin + " to " + riders[i].dest + ", at " + riders[i].time + ":00 hours, " + "it's an average of " + riders[i].riders + "0 riders.");
//   }
// }

// showRiders(riders);

/*
 - Get real local time 'hour'
 - Pick a train line e.g. redLine
 - Filter to closest 'time' value in riders.json based on real 'hour'
 ------
 - Get home origin departure station and time
 - Get final dest departure station and time
 - Calculate duration based on difference in time or just make a best guess
 ------
 - lineTo from redLine SB origin to next dept station e.g. RICH to DELN (origin / dest)
 - Set lineWidth according to riders.ridersCount for the selected origin / dest pair
 - Stroke
 ------
 - Do math to add / subtract riders as they enter / exit
  - Sum all riderCounts for values at a specific station. Subtract from totalCount as they exit.
*/



var redLine = coordinates[0].red;
console.log("redLine:" + redLine);
ctx.moveTo(redLine[0].x, redLine[0].y);

var s = 0;
var duration = 1000;
var startTime = null;

// function getRiders(origin, dest) {
//   // gets riders for a particular trip
//   var ridersTrip = riders.filter((riders.origin === origin) && (riders.dest === dest));
//   return ridersTrip;
//   console.log("ridersTrip: " + ridersTrip);
// }

function isTrip(origin, dest) {
  console.log("isTrip()");
  console.log("riders[s].origin: " + riders[s].origin);
  console.log("origin:" + origin);
  if (riders[s].origin === origin) {
    return true;
    console.log("riders.origin: " + riders.origin);
  }
  else {
    return false;
    console.log("is not trip");
  }
}

function isCurrentOrigin(trip, origin) {
  return trip.origin == "RICH";
}


function animate(time) {
  var origin = redLine[s].station;
  var dest = redLine[s+1].station;
  var tripMatch = riders.filter(function(t) {
    return t.origin == origin && t.dest == dest;
  });
  if (tripMatch[0]) {
    trainLoad = tripMatch[0].riders;
    ctx.lineWidth = trainLoad;
    console.log("trainLoad: " + trainLoad);
  }
  console.log("tripMatch: " + JSON.stringify(tripMatch));
	console.log("redline current station:" + redLine[s].station);
  console.log("redline next station:" + redLine[s+1].station);
	console.log("time: " + time);

  if (!startTime) {
    startTime = time;
  }
  var timeElapsed = time - startTime;
  var delta = Math.min(1, timeElapsed / duration);
  var dX = (redLine[s+1].x - redLine[s].x) * delta;
  var dY = (redLine[s+1].y - redLine[s].y) * delta;

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
