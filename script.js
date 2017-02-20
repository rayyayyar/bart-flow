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

var queue = d3.queue();
var red, blue, orange, yellow, green;
var linesArray = [];
var riders;
var trainLoad = 0;
var endCount = 0;
var h = 0;
var line =  d3.line()
  .x(function(d) { return d.x;  })
  .y(function(d) { return d.y; });

filenames.forEach(function(filename) {
  queue.defer(d3.json, filename);
});

queue.awaitAll(function(error, jsonData) {
  if (error) throw error;
  red = jsonData[0];
  blue = jsonData[1];
  orange = jsonData[2];
  yellow = jsonData[3];
  green = jsonData[4];
  riders = jsonData[5];
  linesArray = [red, blue, orange, yellow, green];
  console.log("linesArray.length: " + linesArray.length);
  console.log("linesArray: " + linesArray);
  setInterval(function() {
    if (linesArray.length < 1) { 
        ++h;
        linesArray = [red, blue, orange, yellow, green];
    }
    var i = Math.floor(Math.random() * linesArray.length);
    draw(linesArray[i], h);
    linesArray.splice(i, 1);

  }, Math.min(Math.random() * 3000, 1000));
  
  console.log("ready");
});

d3.select("body").style("background-color", "floralwhite");

var timerCount = 0;
var ms = 12500 / 60;
function timer() {
  if (timerCount < 60) {
    document.getElementById("minutes").innerHTML = ":" + timerCount;
    setTimeout(timer, ms);
    ++timerCount;
  }
  else {
    document.getElementById("minutes").innerHTML = ":" + "00";
  }
}
timer();

function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}

function draw(lineColor, h) {
  console.log("draw hour " + h);

  var coordinates = lineColor;
  console.log("coordinates: " + JSON.stringify(coordinates));
  var temp = [];
  var time = 0;
  var totalTime = 0;
  
  // filter ridership data to only trips on a specific line (red, blue, green, etc)
  var lineRiders = riders.filter(isOnLine);
  // filter ridership data to direction NB or SB
  var lineRidersSB = lineRiders.filter(isSouthBound);
  var trips = lineRidersSB.filter(tripsHour(h));
  // todo: consider prepping data for each line beforehand

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
  console.log("trips: " + JSON.stringify(trips));

  // loop through to draw each trip individually until the end of coordinates
  for(var i = 0; i < coordinates.length - 1; ++i) {
    temp[0] = coordinates[i];
    temp[1] = coordinates[i+1];
    time = 900;
    var origin = temp[0].station;
    var dest = temp[1].station;
    trainLoad += sumBoard(trips, origin) - sumExits(trips, dest);
    console.log(sumBoard(trips, origin) + " get on at " + origin + " and " + sumExits(trips, dest) + " get off at " + dest);
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
            console.log("hour: " + h);
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
    // a single line has finished
    console.log("this is the end");
    console.log("lineColor: " + lineColor);
    if (h < 24) {
      // if hours left in day, keep drawing random lines every x seconds until all lines have finished the hour
      // var i = linesArray.indexOf(lineColor);
      // linesArray = linesArray.splice(x, 1);

      // if (linesArray.length <= 1) { 
      //   ++h;
      //   linesArray = [red, blue, orange, yellow, green];
      // }

      // whenever a single line ends, draw all remaining lines at random, removing them from lineArray after they are drawn
      // for (var j = 0; j < linesArray.length; ++j) {
      //   var i = Math.floor(Math.random() * linesArray.length);
      //   setTimeout(function() { draw(linesArray[i], h);}, Math.random() * 3000);
      //   linesArray.splice(i, 1);
      // }
      document.getElementById("hour").innerHTML = h;

      // if ((lineColor == red)||(lineColor == blue)||(lineColor == orange)||(lineColor == yellow)||(lineColor == green)) {
      //   ++endCount;
      //   if (endCount >= 5) {
      //     ++h;
      //     timerCount = 0;
      //     document.getElementById("hour").innerHTML = h;
      //     // todo: pick a random line to draw
      //     setTimeout(function() { draw(red, h); }, Math.random() * 2000);
      //     setTimeout(function() { draw(blue, h); }, Math.random() * 2000);
      //     setTimeout(function() { draw(orange, h); }, Math.random() * 2000);
      //     setTimeout(function() { draw(yellow, h); }, Math.random() * 2000);
      //     setTimeout(function() { draw(green, h); }, Math.random() * 2000);
      //     endCount = 0;
      //   }
      // }
    }
  }
}

