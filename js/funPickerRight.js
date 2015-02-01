function funPickerRight() {

  // =====setup=====
  var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    },
    width = 325 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var x = d3.scale.linear()
    .range([0, width])
    .domain([0, 4])
    // .clamp(true)

  var y = d3.scale.linear()
    .range([height, 0])
    .domain([0, 4])

  // .clamp(true)

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    .defined(function(d) {
      return d[1] > 0;
    })
    .x(function(d) {
      return x(d[0])
    })
    .y(function(d) {
      return y(d[1])
    })


  return {
    restrict: 'A',
    link: function(scope, el, attr) {
      var FP = scope.FP;

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

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("y")

      var main = svg.append('g').attr("class", 'main');

      var bg = main.append('rect')
        .attr({
          width: width,
          height: height,
          opacity: 0,
        });

      var path = main.append('path')
        .attr({
          'stroke-width': 2,
          fill: 'none',
          class: 'der',
          opacity: 0.5,
          'stroke': '#3FC380'
        });

      var path2 = main.append('path')
        .datum(FP.goal)
        .attr({
          'stroke-width': 2,
          fill: 'none',
          class: 'der',
          opacity: 0.5,
          'stroke': '#666',
          d: line
        });

      scope.$on('move', function(d) {
        if (FP.derivative.length == 0) return;
        path.datum(FP.derivative).attr('d', line);
      });

    }
  };
}

angular.module('mainApp').directive('funPickerRight', funPickerRight);
