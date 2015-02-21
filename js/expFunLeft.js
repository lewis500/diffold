angular.module('mainApp')
  .directive('expFunLeft', expFunLeft);


angular.module('mainApp')
  .controller('expFunCtrl', expFunCtrl);

function expFunCtrl($scope) {
  var E = this;

  function equation(d) {
    return Math.exp(.5 * d);
  }

  E.goal = _.range(0, 4, 0.1)
    .map(function(t) {
      return [t, 0.5*equation(t), Math.exp(.5 * t)];
    });

  var firstDot = [0, Math.exp(0)];

  E.fit = [];

  firstDot.i = 0;

  E.dots = [firstDot];

  var scale = d3.scale.linear();

  var toFill = _.range(0, 4, 0.1)
    .map(function(t) {
      return [t, null];
    });

  function resort() {
    E.dots.sort(function(a, b) {
      return a[0] - b[0];
    });
  }

  E.j = 1;

  E.der = [];

  function update() {
    // if (E.dots.length < 2) return;
    // E.der = [];
    // E.dots.forEach(function(d, i, k) {
    //   if (i === k.length - 1) return;
    //   var dt = k[i + 1][0] - d[0];
    //   if (dt == 0) return;
    //   var dy = k[i + 1][1] - d[1];
    //   E.der.push([d[0], dy / dt]);
    // });
    // scale.domain(E.dots.map(function(d) {
    //     return d[0];
    //   }))
    //   .range(E.dots.map(function(d) {
    //     return d[1];
    //   }));
    // E.der = _.range(0,4,.1).map(function(d){
    //   return s
    // });
    // var newData = _.union(E.dots, toFill);
    // var r = regression('exponential', newData);
    // E.fit = r.points.sort(function(a, b) {
    //   return a[0] - b[0];
    // })
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

  $scope.$broadcast('addDot');
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
      return x(d[0]);
    })
    .y(function(d) {
      return y(d[1]);
    });

  var line2 = d3.svg.line()
    .interpolate('cardinal')
    // .tension(.7)
    .x(function(d) {
      return x(d[0]);
    })
    .y(function(d) {
      return y(d[1]);
    });

  var line3 = d3.svg.line()
    .x(function(d) {
      return d[0];
    })
    .y(function(d) {
      return d[1];
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

      function sample(d) {
        var precision = 10;
        var path = document.createElementNS(d3.ns.prefix.svg, "path");
        path.setAttribute("d", d);

        var n = path.getTotalLength(),
          t = [0],
          i = 0,
          dt = precision;
        while ((i += dt) < n) t.push(i);
        t.push(n);

        var x0 = .1,
          y0 = 0;
        var delX = x.invert(t[1]);
        return t.map(function(t, i, k) {
          var p = path.getPointAtLength(t),
            x1 = x.invert(p.x),
            y1 = y.invert(p.y),
            a = [
              x1, (y1 - y0) / (x1 - x0), y1
            ];
          y0 = y1;
          x0 = x1;
          // a.t = t / n;
          return a;
        }).slice(1)
      }

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
          scope.$apply(function() {
            E.fit = sample(line2(E.dots));
          });
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
          scope.$apply(function() {
            E.fit = sample(line2(E.dots));
          });
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

      var linePath = main.append('path')
        .attr({
          'stroke-width': 1,
          fill: 'none',
          'stroke': '#D91E18',
          'stroke-dasharray': '2,2'
        });

      var derPath = main.append('path')
        .attr({
          'stroke-width': 2,
          fill: 'none',
          'stroke': '#22A7F0',
          opacity: 0.4,
        });

      var goalPath = main.append('path')
        .datum(E.goal)
        .attr({
          'stroke-width': 1,
          fill: 'none',
          'stroke': '#26A65B',
          d: line
        });

      var dots;

      scope.$on('move', moveFun);

      scope.$on('addDot', addFun);

      addFun();

      function moveFun(d) {
        dots.data(E.dots)
          .attr('transform', function(d) {
            return 'translate(' + [x(d[0]), y(d[1])] + ')'
          });
        linePath.datum(E.dots).attr('d', line2);

        derPath.attr('d', line(E.fit));
        goalPath.attr('d', line);
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

      }

    }
  };

}
