angular.module('mainApp')
  .directive('quadFunLeft', quadFunLeft)
  .directive('quadFunMiddle', quadFunMiddle)
  .controller('quadCtrl', quadCtrl)
  .factory('quadTools', quadTools)
  .factory('drawTools', drawTools);

function quadCtrl($scope, $timeout, $q) {
  var E = this;

  var Dot = {
    init: function(v) {
      _.assign(this, {
        y: v.y,
        t: v.t,
        id: ID()
      });
      return this;
    },
    change: function(v) {
      this.t = v.t;
      this.y = v.y;
      dots.getSorted();
      E.emitMove();
    }
  };

  E.goal = _.range(0, 60)
    .map(function(d) {
      var t = d / 10;
      return {
        dy: 5 - t,
        t: t,
        y: 5 * t - .5 * Math.pow(t, 2)
      };
    });

  E.emitMove = function() {
    $scope.$emit('move');
  };

  var hilite = E.hilite = {
    show: false,
    toggleOn: function(which) {
      var t = which.t
      dots.which = angular
        .extend(which, {
          dy: 5 - t
        });
      fit.which = _.findLast(fit.array, function(d) {
        return d.t <= t;
      });
      this.show = true;
      $scope.$emit('toggleOn');
    },
    toggleOff: function() {
      this.show = false;
      $scope.$emit('toggleOff');
    }
  };

  var dots = E.dots = {
    array: [],
    newDatum: null,
    which: null,
    clearDots: function() {
      this.array = [];
      fit.array = [];
      $scope.$emit('addDot');
      E.emitMove();
    },
    addDot: function(v) {
      this.newDatum = Object.make(Dot).init(v)
      this.array.push(this.newDatum);
      this.getSorted();
      $scope.$emit('addDot');
      E.hilite.toggleOn(this.newDatum);
    },
    removeDot: function(v) {
      var i = this.array.indexOf(v);
      if (i == 0) return;
      this.array.splice(i, 1);
      $scope.$emit('addDot');
      hilite.toggleOff();
    },
    C: 1,
    getSorted: function() {
      this.array.sort(function(a, b) {
        return a.t - b.t;
      });
    },
  };

  var fit = E.fit = {
    refit: function(v) {
      if (!v > 0) return;
      this.array = v;
      if (!dots.which) return;
      this.which = _.find(this.array, function(d) {
        return d.t >= dots.which.t;
      });
      dots.which.dy = this.which.dy;
    },
    array: [],
    which: null,
  };
}

function quadTools() {

  var t = d3.scale.linear()
    .domain([0, 8])
    .clamp(true);

  var y = d3.scale.linear()
    .domain([-2, 10]);

  var y2 = d3.scale.linear()
    .domain([-2, 10]).clamp(true);

  var line = d3.svg.line()
    .interpolate('cardinal', .5)
    .x(function(d) {
      return t(d.t);
    })
    .y(function(d) {
      return y(d.dy);
    });

  var line2 = d3.svg.line()
    .interpolate('cardinal', .2)
    .x(function(d) {
      return t(d.t);
    })
    .y(function(d) {
      return y(d.y);
    });

  return {
    t: t,
    y: y,
    line: line,
    line2: line2,
    y2: y2
  };
}

function drawTools() {
  return {
    yAxis: function(y, svg) {
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
        update: function(width) {
          this.fun.tickSize(-width);
          this.g.call(this.fun);
        }
      };
      return yAxis;
    },
    tAxis: function(t, svg) {
      var tAxis = {
        g: svg.append("g.t.axis"),
        fun: d3.svg.axis()
          .scale(t)
          .ticks(5)
          .orient("bottom"),
        label: svg.append('g')
          .append("text.label")
          .style("text-anchor", "right")
          .text("t"),
        update: function(width, height) {
          this.fun.tickSize(-height);
          this.g.translate([0, height]);
          this.g.call(this.fun);
          this.label.translate([width - 8, height - 5])
        }
      };
      return tAxis;
    }
  };
}

function quadFunLeft(quadTools, drawTools) {
  // =====setup=====
  var M = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 20
  };

  function link(scope, el, attr) {
    var tools = quadTools,
      t = tools.t,
      y = tools.y,
      line = tools.line,
      line2 = tools.line2,
      E = scope.E;
    var width, height;
    var s = d3.select(el[0]).append("svg.quadLeft")
    var svg = s.append("g").translate([M.left, M.top]);

    var clipPath = svg.append('defs').append('svg:clipPath')
      .attr('id', 'clipPath6')
      .append('rect')

    var bg = (function() {
      var addDrag = d3.behavior.drag()
        .on('dragstart', function(d) {
          if (d3.event.defaultPrevented) return;
          var loc = d3.mouse(this);
          E.dots.addDot({
            t: t.invert(loc[0]),
            y: y.invert(loc[1])
          });
        })
        .on('drag', function() {
          E.dots.newDatum.change({
            t: t.invert(d3.event.x),
            y: y.invert(d3.event.y)
          });
          E.fit.refit(sample(line2(E.dots.array)));
        })
        .on('dragend', function(d) {
          E.hilite.toggleOff();
        });

      return svg.append('rect.background')
        .attr({
          rt: 4,
          ry: 4,
        })
        .on("contextmenu", function(d, i) {
          d3.event.preventDefault();
        })
        .call(addDrag);

    })();

    var tAxis = drawTools.tAxis(t, svg);
    var yAxis = drawTools.yAxis(y, svg);

    var main = svg.append('g.main').attr('clip-path', 'url(#clipPath6)')

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
            t: t.invert(d3.event.x),
            y: y.invert(d3.event.y)
          });
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
      },
    };

    var triangle = {
      tri: main.append('path.triangle'),
      tang: main.append('path.tangent'),
      dy: main.append('line.dy'),
      dataMaker: function(d) {
        return [
          [d.t, d.y],
          [d.t + 1, d.y + d.dy],
          [d.t, d.y + d.dy],
        ];
      },
      pathMaker: d3.svg.line()
        .x(function(d) {
          return t(d[0]);
        }).y(function(d) {
          return y(d[1]);
        }),
      update: function() {
        var which = E.dots.which;
        this.tri
          .datum(this.dataMaker(which))
          .attr('d', this.pathMaker);
        this.tang
          .datum([
            [0, which.y - which.t * which.dy],
            [8, which.y + (8 - which.t) * which.dy]
          ])
          .attr('d', this.pathMaker);
        this.dy.attr({
          x1: t(which.t),
          x2: t(which.t),
          y1: y(which.y),
          y2: y(which.y + which.dy)
        });
      }
    };

    var bars = {
      yBar: main.append('rect.yBar').attr('width', 2).translate([2, 0]),
      tBar: main.append('rect.tBar').attr('height', 2).attr('y', -3),
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
        if (!which) return;
        this.shift(this.yBar)
          .attr({
            y: y(which.y),
            height: height - y(which.y),
          });
        this.shift(this.tBar).attr({
          width: t(which.t)
        });
        this.shift(this.yLine).attr({
          y1: height,
          y2: y(which.y),
          x1: t(which.t),
          x2: t(which.t)
        });
        this.shift(this.tLine).attr({
          y1: y(which.y),
          y2: y(which.y),
          x1: 0,
          x2: t(which.t)
        });
      }
    };

    scope.$on('move', function() {
      dots.update();
      plot.update();
      triangle.update();
      E.fit.refit(sample(line2(E.dots.array)));
    });

    scope.$on('slide', function() {
      dots.update();
      plot.update();
      E.fit.refit(sample(line2(E.dots.array)));
    })

    scope.$on('toggleOff', function() {
      bars.hide();
    });

    scope.$on('toggleOn', function() {
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
      return 'translate(' + [t(d.t), y(d.y)] + ')'
    }

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      height = el[0].clientWidth - M.top - M.bottom;
      s.attr('height', height + M.top + M.bottom);
      s.attr('width', width + M.left + M.right);
      y.range([height, 0]);
      t.range([0, width]);
      bg.attr("width", width).attr('height', height);
      clipPath.attr("width", width).attr('height', height);
      bars.tBar.translate([0, height]);
      tAxis.update(width, height);
      yAxis.update(width);
      dots.update();
      plot.update();
    }

    function sample(d) {
      var precision = 8;
      if (!d) return;
      var path = document.createElementNS(d3.ns.prefix.svg, "path");
      path.setAttribute("d", d);

      var n = path.getTotalLength(),
        j = [0],
        i = 0,
        dt = precision;
      while ((i += dt) < n) j.push(i);
      j.push(n);

      var t0 = .1,
        y0 = 0;
      var delT = t.invert(j[1]);
      return j.map(function(j, i, k) {
        var p = path.getPointAtLength(j),
          t1 = t.invert(p.x),
          y1 = y.invert(p.y),
          a = {
            t: t1,
            dy: (y1 - y0) / Math.max(t1 - t0, .0001),
            y: y1
          };
        y0 = y1;
        t0 = t1;
        return a;
      }).slice(1);
    }
  }

  return {
    restrict: 'A',
    link: link
  };

}


function quadFunMiddle(quadTools, drawTools) {
  // =====setup=====
  var M = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 10
  };

  function link(scope, el, attr) {
    var tools = quadTools,
      t = tools.t,
      y = tools.y,
      y2 = tools.y2,
      line = tools.line,
      line2 = tools.line2,
      E = scope.E;
    var width, height;

    var s = d3.select(el[0]).append("svg.quadMiddle");
    var svg = s.append("g").translate([M.left, M.top]);

    var clipPath = svg.append('defs')
      .append('clipPath')
      .attr('id', 'clipDy')
      .append('rect');

    var bg = svg.append('rect.background')
      .attr({
        rx: 4,
        ry: 4,
      });

    var tAxis = drawTools.tAxis(t, svg);
    var yAxis = drawTools.yAxis(t, svg);

    var main = svg.append('g.main').attr('clip-path', 'url(#clipDy)');

    var plot = {
      derPath: main.append('path.derPath'),
      update: function() {
        this.derPath.transition('redraw').duration(75).ease('cubic-out').attr('d', line(E.fit.array));
        this.goal.attr('d', line);
      },
      goal: main.append('path.asdf')
        .datum(E.goal)
        .attr({
          stroke: "#666",
          'stroke-dasharray': '2,2',
          'stroke-width': 2,
          fill: 'none',
          opacity: 0.6,
          d: line
        })
    };

    scope.$on('move', function() {
      plot.update();
    });

    scope.$on('slide', function() {
      plot.update();
    });

    scope.$on('addDot', function() {
      plot.update();
    });

    scope.$on('windowResize', widthResize);

    widthResize();

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      height = el[0].clientWidth - M.top - M.bottom;
      s.attr('height', height + M.top + M.bottom);
      s.attr('width', width + M.left + M.right);
      y.range([height, 0]);
      y2.range([height, 0]);
      t.range([0, width]);
      bg.attr("width", width).attr('height', height);
      clipPath.attr("width", width).attr('height', height);
      tAxis.update(width, height);
      yAxis.update(width);
      plot.update();
    }

  }

  return {
    restrict: 'A',
    link: link
  };

}
