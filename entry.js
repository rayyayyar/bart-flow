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

/* animate each hour
 - loop i through redLineRidersSouthBound array of trip objects
 - animate() first hour while redLineRidersSouthBound.hour == i
 - (slowly) reset the canvas
 - i++
 - animate() next hour where i is 1

*/

var redLine = coordinates[0].red;
var redLineRiders = riders.filter(isOnRed);
console.log("redLineRiders: " + JSON.stringify(redLineRiders));

ctx.moveTo(redLine[0].x, redLine[0].y);
var s = 0;
var duration = 60;
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

//filter function to return all trips of a requested hour

function tripsHour(t) {
  return t.hour == 0;
}

var trips0 = redLineRidersSouthBound.filter(tripsHour);
console.log("trips0: " + JSON.stringify(trips0));

function animate(time, hour) {
  var origin = redLine[s].station;
  var dest = redLine[s+1].station;
  // create new object array where h = current hour
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
    document.getElementById("trip").innerHTML = origin + " to " + dest;
    // document.getElementById("hour").innerHTML = riders[i].time + ":00";
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

function bartFlow() {
  redLineRidersSouthBound.forEach(function(l) {
    for (var i = 0; i < 5; i++) {
      document.getElementById("hour").innerHTML = i;
      if (l.hour == i) {
        startAnim();
        // startAnim() using only hour == i
        console.log("From " + l.origin + " to " + l.dest + ", at " + l.hour + ":00 hours, " + "it's an average of " + l.riders + "0 riders.");
      }
    }
    
  });
}
bartFlow();

