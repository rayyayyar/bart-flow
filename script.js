console.log("Starting a d3 experiment");

/*
currently,

load data
after loading data,
  draw a train line
    massage data to get correct set of trips and ridership data, all per hour 
    start animating each individual path, each delayed by `time`
    after finishing all individual paths,
  if there are more hours, add an hour and draw next train line
*/

var filenames = [
  "red.json", 
  "blue.json", 
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
var red, blue, riders;
var hBlue = 0;
var hRed = 0;
var trainLoad = 0;
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
  riders = jsonData[2];
  draw(blue, hBlue);
  console.log("ready");
});

d3.select("body").style("background-color", "white");

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
    time = 250;
    var origin = temp[0].station;
    var dest = temp[1].station;
    trainLoad += sumBoard(trips, origin) - sumExits(trips, dest);
    console.log(sumBoard(trips, origin) + " get on at " + origin + " and " + sumExits(trips, dest) + " get off at " + dest);
    console.log("trainLoad: " + trainLoad);
    
    var paths = svg.append("path")
      .attr("d", line(temp))
      .attr("stroke", "steelblue")
      // #ED1C24 for red
      .attr("stroke-linecap", "round")
      .attr("stroke-width", function(d, index) { 
        return Math.max(trainLoad / 300, .12);
      })
      .attr("fill", "none");

    var totalLength = paths.node().getTotalLength();

    var n = 0;
    paths.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .attr("opacity", 1.0);
        .transition()
          .delay(totalTime)
          .duration(time)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0)
          .on("end", function(d) {
            console.log("n: " + n);
            console.log("hour: " + h);
            console.log("this: " + this);
            d3.select(this)
              .transition()
                .delay(0)
                .duration(7000)
                .attr("opacity", 0.01);
            ++n;
            if (n >= i) { endAll(h); }
          });

    totalTime += time;
  }

  function endAll(h) {
    console.log("this is the end");
    if (h < 10) {
      h++;
      draw(blue);
      draw(red);
    }
  }
}
