angular.module('mainApp')
  .directive('expFunLeft', expFunLeft);

function expFunLeft() {
  // =====setup=====
  var M = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 20
  };

  var x = d3.scale.linear()
    .domain([0, 8])
    .clamp(true);

  var y = d3.scale.linear()
    .domain([0, 8])
    .clamp(true);

  var line = d3.svg.line()
    .interpolate('cardinal', .5)

  .x(function(d) {
      return x(d.x);
    })
    .y(function(d) {
      return y(d.dy);
    });

  var line2 = d3.svg.line()
    .interpolate('cardinal', .4)
    .x(function(d) {
      return x(d.x);
    })
    .y(function(d) {
      return y(d.y);
    });

  function link(scope, el, attr) {
    var E = scope.E;
    var height = el[0].clientWidth - M.top - M.bottom;
    var width = el[0].clientWidth - M.left - M.right;

    var svg = d3.select(el[0]).append("svg.exp")
      .attr("width", '100%')
      .attr("height", height + M.top + M.bottom)
      .append("g")
      .translate([M.left, M.top]);

    var s = d3.select(el[0]).select('.exp');

    var clipPath = svg.append('defs').append('clip-path')
      .append('rect#clipPath')
      .attr({
        width: width,
        height: height
      });

    var bg = (function() {
      var addDrag = d3.behavior.drag()
        .on('dragstart', function(d) {
          if (d3.event.defaultPrevented) return;
          var loc = d3.mouse(this);
          E.dots.addDot({
            x: x.invert(loc[0]),
            y: y.invert(loc[1])
          });
        })
        .on('drag', function() {
          E.dots.newDatum.change({
            x: x.invert(d3.event.x),
            y: y.invert(d3.event.y)
          });
          E.fit.refit(sample(line2(E.dots.array)));
        })
        .on('dragend', function(d) {
          E.hilite.toggleOff();
          // E.emitMove();
        });

      return svg.append('rect.background')
        .attr({
          height: height,
          rx: 4,
          ry: 4,
        })
        .on("contextmenu", function(d, i) {
          d3.event.preventDefault();
        })
        .call(addDrag);

    })();

    var xAxis = {
      g: svg.append("g.x.axis").translate([0, height]),
      fun: d3.svg.axis()
        .scale(x)
        .ticks(5)
        .tickSize(-height)
        .orient("bottom"),
      label: svg.append('g')
        .append("text.label")
        .style("text-anchor", "right")
        .text("t"),
      update: function() {
        this.fun.tickSize(-height);
        this.g.translate([0, height]);
        this.g.call(this.fun);
        this.label.translate([width - 8, height - 5])
      }
    };

    var yAxis = {
      g: svg.append("g.y.axis"),
      fun: d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient("left"),
      label: svg.append('g')
        .translate([5, 14])
        .append("text.label")
        .style("text-anchor", "left")
        .text("y"),
      update: function() {
        this.fun.tickSize(-width);
        this.g.call(this.fun);
      }
    };

    var main = svg.append('g.main').attr('clip-path', 'url(#clipPath)')

    var dots = {
      circles: null,
      drag: d3.behavior.drag()
        .on('dragstart', function(d, i) {
          if (d3.event.sourceEvent.which == 3) return;
          E.hilite.toggleOn(d);
          E.emitMove();
        })
        .on('drag', function(d, i) {
          if (d3.event.sourceEvent.which == 3) return;
          d.change({
            x: x.invert(d3.event.x),
            y: y.invert(d3.event.y)
          });
          E.fit.refit(sample(line2(E.dots.array)));
        })
        .on('dragend', function(d) {
          E.hilite.toggleOff();
        }),
      add: function() {
        this.circles = main.selectAll('.dot')
          .data(E.dots.array, function(d) {
            return d.id;
          });

        var newD = this.circles
          .enter()
          .append('g.dot')
          .attr('transform', transform)
          .call(this.drag)
          .on("contextmenu", function(d, i) {
            d3.event.preventDefault();
            E.dots.removeDot(d);
          });

        newD.append('circle.selector')
          .attr('r', 8)
          .on('mouseover', function(d) {
            d3.select(this)
              .transition()
              .ease('cubic-out')
              .style('opacity', .4)
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
              .style('opacity', .3)
              .attr('r', 8)
          });

        newD.append('circle')
          .attr({
            r: 4,
            'pointer-events': 'none'
          });
        this.circles.exit().remove();
      },
      update: function() {
        if (!this.circles) return;
        this.circles.data(E.dots.array, function(d) {
            return d.id;
          }).transition().duration(40)
          .attr('transform', transform);
      }
    };

    var plot = {
      funPath: main.append('path.funPath'),
      update: function() {
        this.funPath.datum(E.dots.array).attr('d', line2);
      }
    };

    var bars = {
      yBar: main.append('rect.yBar').attr('width', 2).translate([2, 0]),
      tBar: main.append('rect.tBar').attr('height', 2).attr('y', -3).translate([0, height]),
      tLine: main.append('line.tLine'),
      yLine: main.append('line.yLine'),
      drop: function(tar) {
        return tar.transition().duration(120).ease('cubic-in');
      },
      appear: function(tar, o) {
        return tar.transition('appear').duration(50).attr('opacity', o);
      },
      show: function() {
        this.appear(this.tLine, .7);
        this.appear(this.yLine, .7);
      },
      hide: function() {
        this.drop(this.yBar).attr({
          height: 0,
          y: height
        });
        this.drop(this.tBar).attr({
          width: 0
        });
        this.appear(this.tLine, 0);
        this.appear(this.yLine, 0);
      },
      shift: function(tar) {
        return tar.transition().duration(25).ease('cubic');
      },
      update: function() {
        var which = E.dots.which;
        this.shift(this.yBar)
          .attr({
            y: y(which.y),
            height: height - y(which.y),
          });
        this.shift(this.tBar).attr({
          width: x(which.x)
        });
        this.shift(this.yLine).attr({
          y1: height,
          y2: y(which.y),
          x1: x(which.x),
          x2: x(which.x)
        });
        this.shift(this.tLine).attr({
          y1: y(which.y),
          y2: y(which.y),
          x1: 0,
          x2: x(which.x)
        });
      }
    };

    scope.$on('move', function() {
      dots.update();
      plot.update();
      bars.update();
    });

    scope.$on('toggleOff', function() {
      bars.hide();
    });

    scope.$on('toggleOn', function() {
      bars.update();
      bars.show();
    });

    scope.$on('addDot', function() {
      dots.add();
      E.fit.refit(sample(line2(E.dots.array)));
      dots.update();
      plot.update();
    });

    scope.$on('windowResize', widthResize);

    widthResize();

    function transform(d) {
      return 'translate(' + [x(d.x), y(d.y)] + ')'
    }

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      height = el[0].clientWidth - M.top - M.bottom;
      s.attr('height', height + M.top + M.bottom);
      y.range([height, 0]);
      x.range([0, width]);
      bg.attr("width", width).attr('height', height);
      bars.tBar.translate([0, height]);
      xAxis.update();
      yAxis.update();
      dots.update();
      plot.update();
    }

    function sample(d) {
      var precision = 5;
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
          a = {
            x: x1,
            dy: (y1 - y0) / Math.max(x1 - x0, .0001),
            y: y1
          };
        y0 = y1;
        x0 = x1;
        return a;
      }).slice(1);
    }
  }

  return {
    restrict: 'A',
    link: link
  };

}
