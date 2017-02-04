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
var trainLoad = null;

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
var redLineRiders = riders.filter(isOnRed);
console.log("redLineRiders: " + JSON.stringify(redLineRiders));


ctx.moveTo(redLine[0].x, redLine[0].y);
var s = 0;
var duration = 1000;
var startTime = null;

function matchTrip(origin, dest, t) {
  return t.origin == origin && t.dest == dest;
}

function isSouthBound(t) {
  // assumes coordinate data is always listed north to south
  return getStationIndex(redLine, t.origin) < getStationIndex(redLine, t.dest);
}

function getStationIndex(line, station) {
  var i = line.map(function(e) {
    return e.station;
  }).indexOf(station);
  return i;
}

// filter down redLineRiders json to only Southbound trips
var redLineRidersSouthBound = redLineRiders.filter(isSouthBound);
console.log("redLineRidersSouthBound: " + JSON.stringify(redLineRidersSouthBound));

function isOnRed(t) {
  // is trip object t's origin  == to any of redLine's stations?
  for (var i = 0; i < redLine.length; i++) {
    if (t.origin == redLine[i].station) {
      for (var i = 0; i < redLine.length; i++) {
        if (t.dest == redLine[i].station) {
          return true;
        }
      }
    }
  }
}

// sum all riders that board at an origin station that's on a specific line
function sumBoard (line, origin) {
  console.log("sumBoard()");
  var ridersCount = line.reduce(function(sum, x) {
    if (x.origin == origin) {
      return sum + x.riders;
    }
    return sum;
  }, 1);
  return ridersCount;
}

function animate(time) {
  var origin = redLine[s].station;
  var dest = redLine[s+1].station;
  // create new object array with ridership that matches current origin / dest pair
  var currTrip = riders.filter(matchTrip.bind(this, origin, dest));
  console.log("currTrip: " + JSON.stringify(currTrip));

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
    // train's moving
    requestAnimationFrame(animate);
  } else {
    // train stops
    startTime = null;
    console.log("origin: " + origin);
    console.log(sumBoard(redLineRidersSouthBound, origin) + " boarded at " + origin);
    trainLoad += sumBoard(redLineRidersSouthBound, origin);
    console.log("trainLoad: " + trainLoad);
    if (currTrip[0]) {
      trainLoad -= currTrip[0].riders;
      console.log(currTrip[0].riders + " exit at " + dest);
      console.log("trainLoad -= currTrip[0].riders, trainLoad = " + trainLoad);
      //console.log("trainLoad: " + trainLoad);
      ctx.lineWidth = trainLoad / 250;
    }
    // look for total exits for this destination from all trips
    s++;
    setTimeout(function(){ startAnim() });
  }
}

var startAnim = function() {
  requestAnimationFrame(animate);

};

startAnim();
