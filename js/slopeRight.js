function slopeRight() {
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
    .x(function(d) {
      return x(d[0])
    })
    .y(function(d) {
      return y(d[2])
    });

  return {
    restrict: 'A',
    link: function(scope, el, attr) {
      var svg = d3.select(el[0]).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var gXAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + y(0) + ")")

      gXAxis.call(xAxis)

      gXAxis.append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("x");

      var gYAxis = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

      gYAxis.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("y");

      var main = svg.append('g').attr("class", 'main');

      var bg = main.append('rect')
        .attr({
          width: width,
          height: height,
          opacity: 0,
        });

      var path = main.append('path')
        .attr({
          'stroke-width': 1,
          stroke: '#555',
          opacity: 0.6,
          fill: 'none'
        })

      var bar = main.append('rect')
        .attr({
          width: 4,
          fill: '#22A7F0',
          dx: -2
        });

      scope.$watch('point', function(d) {
        if (d[1] < 0) {
          y.domain([d[1] * 1.3, 4 + d[1]]);
          gYAxis.call(yAxis);
          gXAxis.attr('transform', 'translate(' + [0, y(0)] + ')')
        }

        bar.attr({
          height: Math.abs(y(0) - y(d[1])),
          y: Math.min(y(d[1]), y(0)),
          x: x(d[0])
        });

        path.datum(scope.data.slice(1, d[2]+1))
          .attr('d', line);

      }, true);

    }
  };
}

angular.module('mainApp').directive('slopeRight', slopeRight);
