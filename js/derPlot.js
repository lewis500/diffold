angular.module('mainApp')
  .controller('derCtrl', derCtrl);

angular.module('mainApp')
  .directive('derDer', derDer);

function derCtrl($scope) {

  var bisect = d3.bisector(function(d) {
    return d[0];
  }).right;

  var der = this;
  der.equation = function(d) {
    return [d, -Math.pow(d, 2) + 4 * d, -2 * d + 4];
  };
  der.data = _.range(0, 4, .1).map(der.equation);
  der.update = function(t) {
    der.point = der.data[bisect(der.data, t)];
    $scope.$apply();
  };
  der.point = der.data[bisect(der.data, 1)];
}

function derDer() {
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
      return y(d[1])
    });

  var line2 = d3.svg.line()
    .x(function(d) {
      return x(d[0])
    })
    .y(function(d) {
      return y(d[2])
    });


  function link(scope, el, attr) {
    var der = scope.der;

    var svg = d3.select(el[0]).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gXAxis = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + y(0) + ")");
    gXAxis.call(xAxis);
    gXAxis.append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("x");

    var gYAxis = svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    gYAxis.update = function() {
      this.transition().duration(50).call(yAxis);
      gXAxis.transition().duration(50).attr("transform", "translate(0," + y(0) + ")");
    };

    gYAxis.append("text")
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
        var u = x.invert(d3.mouse(this)[0]);
        der.update(u);
      });

    line2.defined(function(d) {
      return d[0] <= der.point[0];
    });

    var dot = {
      circle: main.append('circle').attr({
        r: 3,
        fill: 'crimson',
        stroke: 'white'
      }),
      update: function(d) {
        this.circle.transition().duration(50).attr('transform', 'translate(' + [x(d[0]), y(d[1])] + ')');
        var m = d[2],
          dx = (m / 2) / Math.pow((1 + Math.pow(m, 2)), 0.5),
          dy = m * dx;
        this.slope.transition().duration(50).attr({
          x1: x(d[0] - dx),
          x2: x(d[0] + dx),
          y1: y(d[1] - dy),
          y2: y(d[1] + dy)
        });
      },
      lineVert: main.append('line').attr({
        class: 'crawl',
      }),
      lineHor: main.append('line').attr({
        class: 'crawl',
      }),
      slope: main.append('line').attr({
        class: 'slope'
      })
    };

    var derLine = {
      bar: main.append('line').attr({
        class: 'slope'
      }),
      path: main.append('path').attr({
        class: 'goal'
      }).datum(der.data),
      update: function(d) {
        this.bar.transition().duration(50)
          .attr({
            x1: x(d[0]),
            x2: x(d[0]),
            y1: y(0),
            y2: y(d[2])
          });
        this.path.transition().duration(50)
          .attr('d', line2);
      }
    };

    var path = main.append('path')
      .datum(der.data)
      .attr({
        'stroke-width': 1,
        fill: 'none',
        'stroke': 'crimson',
      })
      .attr('d', line);

    scope.$watch('der.point', function() {
      y.domain([
        Math.min(0, der.point[2]), y.domain()[1]
      ]);
      path.transition().duration(50).attr('d', line);
      gYAxis.update();
      dot.update(der.point);
      derLine.update(der.point);
    });
  }

  return {
    restrict: 'A',
    link: link
  };

}
