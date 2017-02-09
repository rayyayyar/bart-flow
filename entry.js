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

import coordinates from "./trains.js";
var riders = require("./data/riders.json");
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
c.width = 800;
c.height = 800;
ctx.translate(0.5, 0.5);
ctx.strokeStyle = 'red';
ctx.lineWidth = 1;
ctx.lineCap="round";
var redLine = coordinates[0].red;
var redLineRiders = riders.filter(isOnRed);
// filter down redLineRiders json to only Southbound trips
var redLineRidersSouthBound = redLineRiders.filter(isSouthBound);
var trips = redLineRidersSouthBound.filter(tripsHour(h));
var s = 0;
var duration = 90;
var startTime = null;
var trainLoad = 0;
var h = 0;
ctx.moveTo(redLine[0].x, redLine[0].y);

document.getElementById("hour").innerHTML = "0:00";

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
  var ridersCount = line.reduce(function(sum, x) {
    if (x.origin == origin) {
      return sum + x.riders;
    }
    return sum;
  }, 1);
  return ridersCount;
}

// for a set of trips, sum all riders that exit at a specified dest station
function sumExits (trips, dest) {
  var ridersCount = trips.reduce(function(sum, x) {
    if (x.dest == dest) {
      return sum + x.riders;
    }
    return sum;
  }, 1);
  return ridersCount;
}

//filter function to return only trips of a requested hour
function tripsHour(hour) {
  return function(t) {
    return t.hour == hour;
  }
}

// animates each trip
function animate(time) {
  if (!startTime) {
    startTime = time;
  }
  console.log("s" + s);
  console.log("animate");
  var origin = redLine[s].station;
  var dest = redLine[s+1].station;
  var trips = redLineRidersSouthBound.filter(tripsHour(h));
  console.log("trips:" + JSON.stringify(trips));

  // create new object array with ridership that matches current origin / dest pair
  var currTrip = trips.filter(matchTrip.bind(this, origin, dest));
  var timeElapsed = time - startTime;
  var delta = Math.min(1, timeElapsed / duration);
  var dX = (redLine[s+1].x - redLine[s].x) * delta;
  var dY = (redLine[s+1].y - redLine[s].y) * delta;

  ctx.beginPath();
  ctx.moveTo(Math.round(redLine[s].x), Math.round(redLine[s].y));
  ctx.lineTo(Math.round(redLine[s].x + dX), Math.round(redLine[s].y + dY));
  ctx.lineWidth = trainLoad / 300;
  ctx.stroke();

	if (delta < 1) {
    // train's moving, keep repainting
    requestAnimationFrame(animate);
  } else {
    // train stops
    startTime = null;
    document.getElementById("trip").innerHTML = origin + " to " + dest;
    console.log("origin: " + origin);
    console.log(sumBoard(trips, origin) + " boarded at " + origin);
    trainLoad += sumBoard(trips, origin);
    console.log(sumExits(trips, dest) + " actually exit at " + dest);
    trainLoad -= sumExits(trips, dest);
    console.log("trainLoad: " + trainLoad);
    if (trainLoad < 1) {
      ctx.lineWidth = .025;
    }
    else ctx.lineWidth = trainLoad / 300;

    s++;
    if (s < redLine.length - 1) {
      console.log("redLine.length: " + redLine.length + "," + "s: " + s);
    } else if (s >= redLine.length - 2) {
      h++;
      s = 0;
      console.log("s: " + s);
      console.log("h: " + h);
      document.getElementById("hour").innerHTML = h + ":00";
      var trips = redLineRidersSouthBound.filter(tripsHour(h));
    }
    startAnim();
  }
}

function startAnim(trips) {
  requestAnimationFrame(animate);
};

startAnim();