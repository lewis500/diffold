angular.module('mainApp')
  .directive('expFunRight', expFunRight);

function expFunRight() {
  // =====setup=====
  var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50
    },
    width = 350 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var x = d3.scale.linear()
    .range([0, width])
    .domain([0, 6])

  var y = d3.scale.linear()
    .range([height, 0])
    .domain([0, 6])

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    .x(function(d) {
      return x(d[2]);
    })
    .y(function(d) {
      return y(d[1]);
    });

  var line2 = d3.svg.line()
    .x(function(d) {
      return x(d[2]);
    })
    .y(function(d) {
      return y(d[1]);
    });

  return {
    restrict: 'A',
    link: function(scope, el, attr) {
      var E = scope.E;

      var svg = d3.select(el[0]).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("x");

      var gYAxis = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      gYAxis.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("y");

      var main = svg.append('g').attr("class", 'main');

      var linePath = main.append('path')
        .attr({
          'stroke-width': 1,
          fill: 'none',
          'stroke': '#D91E18',
          'stroke-dasharray': '2,2'
        });

      var goalPath = main.append('path')
        .datum(E.goal)
        .attr({
          'stroke-width': 1,
          fill: 'none',
          'stroke': '#26A65B',
          d: line
        });

      scope.$on('move', moveFun);

      function moveFun(d) {
        if (E.fit.length == 0) return;
        linePath.datum(E.fit).attr('d', line2);
      }

    }
  };

}
