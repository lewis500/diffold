function barOne() {

  function link(scope, el, attr) {
    // =====setup=====
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
      },
      width = 150 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1)
      .domain(['f(t)', 'target']);

    var y = d3.scale.linear()
      .range([height, 0])
      .domain([-1, 4]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var svg = d3.select(el[0]).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var main = svg.append('g').attr("class", 'main');

    var bar = main.selectAll('rect')
        .data([0,1])
        .enter()
        .append('rect')
        .attr({
          x: function(d, i) {
            return x((i == 0 ? 'f(t)' : 'target'));
          },
          width: x.rangeBand(),
          class: 'bar',
          opacity: 0.6,
          fill: function(d,i){
            return i == 0 ? 'crimson' : '#22A7F0';
          }
        });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + y(0) + ")")
      .call(xAxis);

    scope.$watch('point', function() {
      bar.data([scope.point, [0, 2]])
        .attr({
          height: function(d) {
            return Math.abs(y(0) - y(d[1]));
          },
          y: function(d) {
            return Math.min(y(d[1]),y(0))
          }
        })
    }, true)

  }


  return {
    scope: {
      point: '=point'
    },
    restrict: 'A',
    link: link
  };

}


angular.module('mainApp')
  .directive('barOne', barOne)
