angular.module('mainApp')
  .directive('expFunLeft', expFunLeft);


angular.module('mainApp')
  .controller('expFunCtrl', expFunCtrl);

function expFunCtrl($scope) {
  var E = this;

  function equation(d) {
    return Math.exp(0.5 * d);
  }

  E.goal = _.range(0, 4, 0.1).map(function(t) {
    return [t, equation(t)];
  });

  E.dots = [];

  var toFill = _.range(0, 4, 0.1).map(function(t) {
    return [t, null];
  });

  function resort() {
    E.dots.sort(function(a, b) {
      return a[0] - b[0];
    });
  }

  E.j = 0;

  function update() {
    if (E.dots.length < 2) return;
    var newData = _.union(E.dots, toFill);
    var r = regression('exponential', newData);
    E.fit = r.points.sort(function(a, b) {
      return a[0] - b[0];
    })
    $scope.$apply();
    $scope.$broadcast('move');
  }

  E.addDot = function(d) {
    E.j++;
    E.dots.push(d);
    resort();
    $scope.$broadcast('addDot');
    update();
  };

  E.removeDot = function(d) {
    E.dots.splice(E.dots.indexOf(d), 1);
    $scope.$broadcast('addDot');
    update();
  };

  E.drag = function(d, res) {
    d[0] = res[0];
    d[1] = res[1];
    resort();
    update();
  };

}

function expFunLeft() {
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
      return x(d[0]);
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

      var newDatum;

      var dragNew = d3.behavior.drag()
        .on('dragstart', function(d) {
          if (d3.event.defaultPrevented) return;
          var loc = d3.mouse(this);
          newDatum = [x.invert(loc[0]), y.invert(loc[1])];
          newDatum.i = E.j;
          E.addDot(newDatum);
        })
        .on('drag', function() {
          E.drag(newDatum, [x.invert(d3.event.x), y.invert(d3.event.y)]);
        })
        .on('dragend', function(d) {
          d3.event.sourceEvent.stopPropagation(); // silence other listeners
        });

      var dragExisting = d3.behavior.drag()
        .on('dragstart', function(d) {
          d3.event.sourceEvent.stopPropagation(); // silence other listeners
        })
        .on('drag', function(d) {
          if (d3.event.sourceEvent.which == 3) return;
          E.drag(d, [x.invert(d3.event.x), y.invert(d3.event.y)]);
        })
        .on('dragend', function(d) {
          d3.event.sourceEvent.stopPropagation(); // silence other listeners
        });

      var bg = main.append('rect')
        .attr({
          width: width,
          height: height,
          opacity: 0,
        })
        .call(dragNew);

      var fitPath = main.append('path')
        .attr({
          'stroke-width': 1,
          fill: 'none',
          'stroke': '#22A7F0',
          opacity: 0.8,
        });

      var linePath = main.append('path')
        .attr({
          'stroke-width': 1,
          fill: 'none',
          'stroke': '#D91E18',
          opacity: 0.4,
          'stroke-dasharray': '2,2'
        });

      var dots;

      scope.$on('move', moveFun);

      scope.$on('addDot', addFun);

      function moveFun(d) {
        dots.data(E.dots)
          .attr('transform', function(d) {
            return 'translate(' + [x(d[0]), y(d[1])] + ')'
          });
        fitPath.datum(E.fit).attr('d', line);
        linePath.datum(E.dots).attr('d', line);
      }

      function addFun() {
        dots = main.selectAll('.dot')
          .data(E.dots, function(d) {
            return d.i;
          });

        var newD = dots
          .enter()
          .append('g')
          .attr({
            class: 'dot',
            transform: function(d) {
              return 'translate(' + [x(d[0]), y(d[1])] + ')'
            }
          })
          .call(dragExisting)
          .on("contextmenu", function(d) {
            //handle right click
            E.removeDot(d);
            d3.event.preventDefault();
          });

        newD.append('circle')
          .attr({
            r: 4,
          });

        newD.append('circle')
          .attr({
            r: 8,
            'fill-opacity': 0.03,
            fill: "#EF4836",
            stroke: 'D91E18',
            'stroke-width': '1',
            'stroke-opacity': .03
          })
          .on('mouseover', function(d) {
            d3.select(this)
              .transition()
              .ease('cubic-out')
              .attr('fill-opacity', .05)
              .attr('r', 13)
          })
          .on('mouseout', function(d) {
            d3.select(this)
              .transition()
              .ease('cubic')
              .duration(100)
              .attr('r', 15)
              .transition()
              .duration(350)
              .ease('cubic-out')
              .attr('fill-opacity', .03)
              .attr('r', 8)
          });

        dots.exit().remove();

        fitPath.datum(E.fit).attr('d', line);
        linePath.datum(E.dots).attr('d', line);

        scope.$broadcast('move');

      }

    }
  };

}
