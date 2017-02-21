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
  .attr("width", 1000)
  .attr("height", 1000)
  .attr("id", "visualization")
  .attr("xmlns", "http://www.w3.org/2000/svg");

d3.select("body").style("background-color", "floralwhite");
var queue = d3.queue();
var red, blue, orange, yellow, green;
var linesArray = [];
var riders;
var trainLoad = 0;
var endCount = 0;
var h = 0;
var redTrips = [];
var trips;
var line =  d3.line()
  .x(function(d) { return d.x;  })
  .y(function(d) { return d.y; });

filenames.forEach(function(filename) {
  queue.defer(d3.json, filename);
});

queue.awaitAll(function(error, jsonData) {
  if (error) throw error;
  // assign coordinate data
  red = jsonData[0];
  blue = jsonData[1];
  orange = jsonData[2];
  yellow = jsonData[3];
  green = jsonData[4];
  riders = jsonData[5];
  linesArray = [red, blue, orange, yellow, green];

  // assign massaged ridership data per line
  var redTrips = massage(red);
  var blueTrips = massage(blue);
  var orangeTrips = massage(orange);
  var yellowTrips = massage(yellow);
  var greenTrips = massage(green);
  var tripsArray = [redTrips, blueTrips, orangeTrips, yellowTrips, greenTrips];
  
  var interval = setInterval(function() {
    if (h >= 23) { clearInterval(interval); }
    if (linesArray.length < 1) {
      ++h;
      document.getElementById("hour").innerHTML = h;
      linesArray = [red, blue, orange, yellow, green];
      tripsArray = [redTrips, blueTrips, orangeTrips, yellowTrips, greenTrips];
    }
    var i = Math.floor(Math.random() * linesArray.length);
    console.log("trips: " + JSON.stringify(trips));

    // draw using coordinate data and ridership data for specific line and hour
    draw(linesArray[i], tripsArray[i][h]);
    linesArray.splice(i, 1);
    tripsArray.splice(i, 1);

  }, Math.min(Math.random() * 4000, 2500));
});


function massage(line) {
  var coordinates = line;
  // filter ridership data to only trips on a specific line (red, blue, green, etc)
  var lineRiders = riders.filter(isOnLine);
  // filter ridership data to direction NB or SB
  var lineRidersSB = lineRiders.filter(isSouthBound);
  // console.log(JSON.stringify(lineRidersSB));
  var trips = [];
  for (var h = 0; h <24; ++h) {
    var tripsPerHour = lineRidersSB.filter(tripsHour(h));
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
  console.log("draw hour " + h);
  console.log("trips: " + JSON.stringify(trips));
  var coordinates = lineColor;
  var temp = [];
  var time = 0;
  var totalTime = 0;
  var trainLoad = 0;

  // loop through to draw each trip individually until the end of coordinates
  for(var i = 0; i < coordinates.length - 1; ++i) {
    temp[0] = coordinates[i];
    temp[1] = coordinates[i+1];
    time = 900;
    var origin = temp[0].station;
    var dest = temp[1].station;

    trainLoad += sumBoard(trips, origin) - sumExits(trips, dest);
    console.log("At " + h + ":00, " + sumBoard(trips, origin) + " get on at " + origin + " and " + sumExits(trips, dest) + " get off at " + dest);
    console.log("trainLoad: " + trainLoad);

    
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

    var n = 0;
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
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("opacity", 0.018);
            ++n;
            // when all paths are drawn on a trainline
            if (n >= i) {
              endAll(lineColor);
            }
          });

    totalTime += time;
    // todo: animate analog clock based on time
  }

  function endAll(lineColor) {
    console.log("A single line has finished.");
  }
}

