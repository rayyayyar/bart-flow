document.addEventListener("DOMContentLoaded", function() { 
  stickBottom();
});

var filenames = [
  "red.json", 
  "blue.json",
  "orange.json",
  "yellow.json",
  "green.json",
  "riders.json"
  ];

//append svg to div#line
var svg = d3.select("#line")
  .append("svg")
  .attr("opacity", 1.0)
  .classed("constrained", true)
  .attr("viewBox", "0 50 800 800")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("id", "visualization")
  .attr("xmlns", "http://www.w3.org/2000/svg");

d3.select("body").style("background-color", "floralwhite");
var queue = d3.queue();
var red, blue, orange, yellow, green;
var redTrips, blueTrips, orangeTrips, yellowTrips, greenTrips;
var linesArray = [];
var tripsArray = [];
var riders;
var trainLoad = 0;
var endCount = 0;
var h = 4;
var trips;
var direction;
var timeConst = 100;
var fadeDuration = timeConst * 10;
var controls;
var line =  d3.line()
  .x(function(d) { return d.x;  })
  .y(function(d) { return d.y; })
  .curve(d3.curveCatmullRom);

filenames.forEach(function(filename) {
  queue.defer(d3.json, filename);
});

queue.awaitAll(function(error, jsonData) {
  if (error) throw error;
  document.getElementById("hour").innerHTML = convertMilitary(h);
  // assign coordinate data
  red = jsonData[0];
  blue = jsonData[1];
  orange = jsonData[2];
  yellow = jsonData[3];
  green = jsonData[4];
  riders = jsonData[5];
  linesArray = [red, blue, orange, yellow, green];

  // assign massaged ridership data per line
  direction = "south";
  redTrips = massage(red, direction);
  blueTrips = massage(blue, direction);
  orangeTrips = massage(orange, direction);
  yellowTrips = massage(yellow, direction);
  greenTrips = massage(green, direction);
  tripsArray = [redTrips, blueTrips, orangeTrips, yellowTrips, greenTrips];
  // interval;
});

function convertMilitary(hour) {
  if (hour > 23) {
    return "0:00 am";
  }
  if (hour > 11) {
    if (hour > 12) { hour = hour - 12; }
    return hour + ":00 pm";
  }
  else return hour + ":00 am";
}

var interval = setInterval(function() {
  if (h > 23) {
    h = 0;
    document.getElementById("hour").innerHTML = convertMilitary(h);
    d3.select("svg")
      .transition()
        .duration(70*timeConst)
        .attr("opacity", 0)
        .on("end", function() {
          d3.select(this).selectAll("*").remove()
          d3.select(this).transition().attr("opacity", 1.0);
        });
  }

  if (linesArray.length < 1) {
    ++h;
    document.getElementById("hour").innerHTML = convertMilitary(h);
    linesArray = [red, blue, orange, yellow, green];
    tripsArray = [redTrips, blueTrips, orangeTrips, yellowTrips, greenTrips];
  }
  var i = Math.floor(Math.random() * linesArray.length);
  // draw using coordinate data and ridership data for specific line and hour
  draw(linesArray[i], tripsArray[i][h]);
  linesArray.splice(i, 1);
  tripsArray.splice(i, 1);

}, 25 * timeConst);

function massage(line, direction) {  
  var coordinates = line;
  
  // filter ridership data to direction NB or SB
  if (direction == "north") {
    // filter ridership data to only trips on a specific line (red, blue, green, etc)
    var lineRidersBound = riders.filter(isOnLine).filter(isNorthBound);
  }
  else if (direction == "south") {
    var lineRidersBound = riders.filter(isOnLine).filter(isSouthBound);
  }
  var trips = [];
  for (var h = 0; h <24; ++h) {
    var tripsPerHour = lineRidersBound.filter(tripsHour(h));
    trips.push(tripsPerHour);
  }  
  return trips;
  //returns trips for all hours on a line

  function isOnLine(t) {
    // is trip object t's origin  == to any of coordinates's stations?
    for (var i = 0; i < coordinates.length; i++) {
      if (t.origin == coordinates[i].station) {
        for (var i = 0; i < coordinates.length; i++) {
          if (t.dest == coordinates[i].station) {
            return true;
          }
        }
      }
    }
  }

  function isSouthBound(t) {
    // assumes coordinate data is always listed north to south
    return getStationIndex(coordinates, t.origin) < getStationIndex(coordinates, t.dest);
  }

  function isNorthBound(t) {
    return getStationIndex(coordinates, t.origin) > getStationIndex(coordinates, t.dest);
  }

  function getStationIndex(line, station) {
    var i = line.map(function(e) {
      return e.station;
    }).indexOf(station);
    return i;
  }

  // filter function to return only trips of a requested hour
  function tripsHour(hour) {
    return function(t) {
      return t.hour == hour;
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

function draw(lineColor, trips) {
  var temp = [];
  var time = 0;
  var totalTime = 0;
  var trainLoad = 0;
  var coordinates = Array.prototype.slice.call(lineColor);
  if (direction == "north") {
    var reverse = reverse || false;
    if(!reverse) coordinates.reverse();
  }

  // loop through to draw each trip individually until the end of coordinates
  for(var i = 0; i < coordinates.length - 1; ++i) {
    temp[0] = coordinates[i];
    temp[1] = coordinates[i+1];
    time = 9 * timeConst;
    var origin = temp[0].station;
    var dest = temp[1].station;

    trainLoad += sumBoard(trips, origin) - sumExits(trips, dest);
    // console.log("At " + h + ":00, " + sumBoard(trips, origin) + " get on at " + origin + " and " + sumExits(trips, dest) + " get off at " + dest);
    
    var paths = svg.append("path")
      .attr("d", line(temp))
      .attr("stroke", function() {
        if (lineColor == blue) {
          return "#00AEEF";
        }
        else if (lineColor == red) {
          return "#ED1C24";
        }
        else if (lineColor == orange) {
          return "#ED9F1B";
        }
        else if (lineColor == yellow) {
          return "#FFDE00";
        }
        else if (lineColor == green) {
          return "#4DB848";
        }
      })
      .attr("stroke-linecap", "round")
      .attr("stroke-width", function(d, index) { 
        return Math.max(trainLoad / 300, .12);
      })
      .attr("fill", "none");

    var totalLength = paths.node().getTotalLength();

    paths.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .attr("opacity", 1.0)
        .transition()
          .delay(totalTime)
          .duration(time)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0)
          .on("end", function(d) {
            d3.select(this)
              .transition()
                .delay(0)
                .duration(fadeDuration)
                .ease(d3.easeLinear)
                .attr("opacity", 0.015);
          });

    totalTime += time;
  }

  function update(fade) {
    fadeDuration = fade;
  }

  if (h > 17) {
    d3.select("body").style("background-color", "#1F2A4D");
    d3.select(".time, .question").style("color", "#FFFFFF");
  }
  else if (h > 3) {
    d3.select("body").style("background-color", "floralwhite"); 
    d3.select(".time").style("color", "cadetblue");
  }
  if (h > 11) {
    d3.select("#fade")
      .on("input", function() {
        update(+this.value);
      });
    document.onmousemove = function(){
      idleTime = 0;
      d3.select("#controls")
      .attr("class", "show");
    }
    document.onmousedown = function() {
      idleTime = 0;
      d3.select("#controls")
        .attr("class", "show");
    }
  }
  d3.select("#inboundswitch")
    .on("click", function() {
      if (direction = "north") {
        direction = "south";
        redTrips = massage(red, direction);
        blueTrips = massage(blue, direction);
        orangeTrips = massage(orange, direction);
        yellowTrips = massage(yellow, direction);
        greenTrips = massage(green, direction);
        tripsArray = [redTrips, blueTrips, orangeTrips, yellowTrips, greenTrips];
      }
    });
  d3.select("#outboundswitch")
    .on("click", function() {
      if (direction = "south") {
        direction = "north";
        redTrips = massage(red, direction);
        blueTrips = massage(blue, direction);
        orangeTrips = massage(orange, direction);
        yellowTrips = massage(yellow, direction);
        greenTrips = massage(green, direction);
        tripsArray = [redTrips, blueTrips, orangeTrips, yellowTrips, greenTrips];
      }
    });
}
// end draw()

// Set timer to fade out controls
idleTime = setInterval(function(){ if(h>11) {timerIncrement();}}, 1000);
var idleTime = 0;
function timerIncrement() {
  if (idleTime == 0) {
    d3.select("#controls")
    .attr("class", "show");
  }
  if (idleTime > 6) {
    d3.select("#controls")
    .attr("class", "hidden");
  }
  idleTime++;
}

function stickBottom() {
 document.getElementById("footer").style.bottom = 0;
}

window.onresize = stickBottom;

