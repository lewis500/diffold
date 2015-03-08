angular.module('mainApp')
  .controller('slopeCtrl', slopeCtrl)
  .directive('slopeDer', slopeDer)
  .directive('slopeDer2', slopeDer2);

function slopeCtrl($scope) {
  var S = this;

  function formula(t) {
    return Math.pow(t, 3) - 7 * Math.pow(t, 2) + 14 * t - 5;
  }

  function dform(t) {
    return 3 * Math.pow(t, 2) - 14 * t + 14;
  }

  S.fun = _.range(0, 100).map(function(d) {
    var t = d / 25;
    return {
      t: t,
      y: formula(t),
      dy: dform(t)
    };
  });

  S.update = function(t) {
    S.dot = {
      y: formula(t),
      t: t,
      dy: dform(t)
    };
    $scope.$broadcast('move');
  };

  S.update(2);

}

function slopeDer() {
  // =====setup=====
  var M = {
    top: 20,
    right: 35,
    bottom: 20,
    left: 20
  };

  var t = d3.scale.linear()
    .domain([0, 4]);

  var y = d3.scale.linear()
    .domain([-3, 9]);

  var line = d3.svg.line()
    .x(function(d) {
      return t(d.t);
    })
    .y(function(d) {
      return y(d.y);
    });

  function link(scope, el, attr) {
    var S = scope.S;
    var width = el[0].clientWidth - M.left - M.right;
    var height = width * 0.65;
    var s = d3.select(el[0]).append("svg.slopeOne")
      .attr("width", width + M.left + M.right)
      .attr("height", height + M.top + M.bottom);

    var svg = s.append("g")
      .translate([M.left, M.top]);

    var bg = svg.append('rect.background')
      .attr({
        height: height,
        rx: 4,
        ry: 4,
      }).on('mousemove', function() {
        S.update(t.invert(d3.mouse(this)[0]));
      });

    var tAxis = {
      g: svg.append("g.t.axis").translate([0, height]),
      fun: d3.svg.axis()
        .scale(t)
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

    var clipPath = s.append('defs')
      .append('svg:clipPath')
      .attr('id', 'clipPathSlopeOne')
      .append('rect')
      .attr({
        width: width,
        height: height
      });

    var main = svg.append('g.main')
      .attr('clip-path', 'url(#clipPathSlopeOne)');

    var plot = {
      zeroLine: main.append('line.zero'),
      funPath: main.append('path.funPath'),
      update: function() {
        this.funPath.attr('d', line(S.fun));
        this.zeroLine.attr({
          x1: t(0),
          x2: width,
          y1: y(0),
          y2: y(0)
        });
      }
    };

    var dot = {
      format: d3.format('.1f'),
      circle: main.append('circle.dot2').attr('r', 4),
      update: function() {
        this.circle.translate([t(S.dot.t), y(S.dot.y)]);
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
        this.tri
          .datum(this.dataMaker(S.dot))
          .attr('d', this.pathMaker);
        this.tang
          .datum([
            [0, S.dot.y - S.dot.t * S.dot.dy],
            [8, S.dot.y + (8 - S.dot.t) * S.dot.dy]
          ])
          .attr('d', this.pathMaker);
        this.dy.attr({
          x1: t(S.dot.t),
          x2: t(S.dot.t),
          y1: y(S.dot.y),
          y2: y(S.dot.y + S.dot.dy)
        });
      }
    };

    scope.$on('move', function() {
      // var a = d3.min(S.fun.map(function(d){
      //   return 
      // }));
      // var b = d3.min([a, ])
      // y.domain([
      //     d3.max([])

      //   ]);
      dot.update();
      triangle.update();
    });

    scope.$on('windowResize', widthResize);

    widthResize();

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      height = width * 0.55;
      s.attr('height', height + M.top + M.bottom);
      s.attr('width', width + M.left + M.right);
      y.range([height, 0]);
      t.range([0, width]);
      bg.attr("width", width).attr('height', height);
      tAxis.update();
      yAxis.update();
      plot.update();
      dot.update();
      clipPath.attr("width", width).attr('height', height);

    }

  }

  return {
    restrict: 'A',
    link: link
  };

}

function slopeDer2() {
  // =====setup=====
  var M = {
    top: 20,
    right: 35,
    bottom: 20,
    left: 20
  };

  var t = d3.scale.linear()
    .domain([0, 4]);

  var y = d3.scale.linear()
    .domain([-3, 9]);

  var line = d3.svg.line()
    .x(function(d) {
      return t(d.t);
    })
    .y(function(d) {
      return y(d.dy);
    });

  function link(scope, el, attr) {
    var S = scope.S;
    var width = el[0].clientWidth - M.left - M.right;
    var height = width * 0.65;
    var s = d3.select(el[0]).append("svg.slopeTwo")
      .attr("width", width + M.left + M.right)
      .attr("height", height + M.top + M.bottom);

    var svg = s.append("g")
      .translate([M.left, M.top]);

    var clipPath = s.append('defs')
      .append('clipPath#clipPathSlope2')
      .append('rect')
      .attr({
        width: width,
        height: height
      });

    var bg = svg.append('rect.background')
      .attr({
        height: height,
        rx: 4,
        ry: 4,
      }).on('mousemove', function() {
        S.update(t.invert(d3.mouse(this)[0]));
      });

    var tAxis = {
      g: svg.append("g.t.axis").translate([0, height]),
      fun: d3.svg.axis()
        .scale(t)
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
        .style("text-anchor", "right")
        .text("y'"),
      update: function() {
        this.fun.tickSize(-width);
        this.g.call(this.fun);
      }
    };

    var main = svg.append('g.main').attr('clip-path', 'url(#clipPathSlope2)')

    var plot = {
      funPath: main.append('path.derPath'),
      zeroLine: main.append('line.zero'),
      
      update: function() {
        this.funPath
          .attr('d', line(S.fun.filter(function(d) {
            return d.t < S.dot.t;
          })));
        this.zeroLine.attr({
          x1: t(0),
          x2: width,
          y1: y(0),
          y2: y(0)
        });
      }
    };

    var dot = {
      format: d3.format('.1f'),
      bar: main.append('line.dy'),
      circle: main.append('circle.dot2').attr('r', 4),
      update: function() {
        this.circle.translate([t(S.dot.t), y(S.dot.dy)]);
        this.bar.attr({
          x1: t(S.dot.t),
          x2: t(S.dot.t),
          y1: y(S.dot.dy),
          y2: y(0)
        });
      },
    };

    scope.$on('move', function() {
      dot.update();
      plot.update();
    });

    scope.$on('windowResize', widthResize);

    widthResize();

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      height = width * 0.55;
      s.attr('height', height + M.top + M.bottom);
      s.attr('width', width + M.left + M.right);
      y.range([height, 0]);
      t.range([0, width]);
      bg.attr("width", width).attr('height', height);
      tAxis.update();
      yAxis.update();
      plot.update();
      dot.update();
      clipPath.attr("width", width).attr('height', height);
    }


  }

  return {
    restrict: 'A',
    link: link
  };

}
