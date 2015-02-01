function funPlotLeft() {

  function link(scope, el, attr) {
    // =====setup=====
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
      },
      width = 400 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    var x = d3.scale.linear()
      .rangeRound([0, width])
      .domain([0, 4])
      // .rangeRound()

    var y = d3.scale.linear()
      .range([height, 0])
      .domain([-1, 4])

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
      .text("y")

    var main = svg.append('g').attr("class", 'main');

    var bg = main.append('rect')
      .attr({
        width: width,
        height: height,
        opacity: 0,
      })
      .on('mousemove', function() {

        var u = x.invert(d3.mouse(this)[0])
        scope.$apply(function() {
          scope.point = [u, Math.pow(u, 2) - 2 * u];
        });

      });

    var line = d3.svg.line()
      .x(function(d) {
        return x(d[0])
      })
      .y(function(d) {
        return y(d[1])
      });

    var dot = {
      circle: main.append('circle').attr({
        r: 3,
        fill: 'crimson',
        stroke: 'white'
      }),
      update: function(d) {
        var loc = [x(d[0]), y(d[1])];
        this.circle.attr('transform', 'translate(' + loc + ')');
        this.lineVert.attr({
          x1: loc[0],
          x2: loc[0],
          y1: y(0),
          y2: loc[1]
        });
        this.lineHor.attr({
          x1: 0,
          x2: loc[0],
          y1: loc[1],
          y2: loc[1]
        });
      },
      lineVert: main.append('line').attr({
          class: 'crawl',
        }),
      lineHor: main.append('line').attr({
          class: 'crawl',
        })
    };

    var path = main.append('path')
      .attr({
        'stroke-width': 1,
        fill: 'none',
        'stroke': 'crimson',
      });

    scope.$watch('data', function() {

      path.datum(scope.data)
        .attr('d', line);

    });

    scope.$watch('point', function() {
      dot.update(scope.point)
    });

  }


  return {
    scope: {
      data: '=data',
      point: '=point'
    },
    restrict: 'A',
    link: link
  };

}


angular.module('mainApp')
  .directive('funPlotLeft', funPlotLeft)
