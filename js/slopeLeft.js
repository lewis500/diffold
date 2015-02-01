function slopeLeft() {
  // =====setup=====
  var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    },
    width = 350 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var x = d3.scale.linear()
    .range([0, width])
    .domain([0, 4])

  var y = d3.scale.linear()
    .range([height, 0])
    .domain([0, 4])

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    .defined(function(d) {
      return d[0] >= 0;
    })
    .x(function(d) {
      return x(d[0])
    })
    .y(function(d) {
      return y(d[1])
    });

  return {
    restrict: 'A',
    link: function(scope, el, attr) {

      var svg = d3.select(el[0]).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("x");

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("y");

      var main = svg.append('g').attr("class", 'main');

      var bisect = d3.bisector(function(d) {
        return d[0];
      }).right;

      function mousemoveCall() {
        var i = bisect(scope.data, x.invert(d3.mouse(this)[0]));
        var d = scope.data[i];
        if (!d) return;
        var m = d[2],
          dx = (m / 2) / Math.pow((1 + Math.pow(m, 2)), 0.5),
          dy = m * dx;

        slopeLine.transition().duration(40).ease('linear').attr({
          x1: x(d[0] - dx),
          x2: x(d[0] + dx),
          y1: y(d[1] - dy),
          y2: y(d[1] + dy)
        });

        dot.transition().duration(40).ease('linear').attr({
          transform: 'translate(' + [x(d[0]), y(d[1])] + ')'
        });

        scope.$apply(function() {
          scope.point = [d[0], d[2], i];
        });

      }

      var bg = main.append('rect')
        .attr({
          width: width,
          height: height,
          opacity: 0,
        })
        .on('mousemove', mousemoveCall);

      var path = main.append('path')
        .datum(scope.data)
        .attr({
          'stroke-width': 1,
          fill: 'none',
          'stroke': 'crimson',
          opacity: 0.9,
          d: line
        });

      var slopeLine = main.append('line')
        .attr({
          'stroke-width': 4,
          fill: 'none',
          'stroke': '#22A7F0',
          opacity: 0.6,
          'marker-end': "url(#triangle)"
        });

      var dot = main.append('circle')
        .attr({
          r: 3,
          fill: 'crimson',
          stroke: 'white',
          // 'stroke-width': 
        })

    }
  };
}

angular.module('mainApp').directive('slopeLeft', slopeLeft);
