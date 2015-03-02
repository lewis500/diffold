angular.module('mainApp')
  .controller('eCtrl', eCtrl)
  .directive('eFunDer', eFunDer);

function eCtrl($scope) {
  var E = this;

  E.k = .5;

  function formula(t) {
    return Math.exp(t * E.k);
  };

  E.fun = _.range(0, 100).map(function(d) {
    var t = d / 25;
    return {
      t: t,
      y: formula(t),
      dy: E.k * formula(t)
    };
  });

  E.update = function(t) {
    E.dot = {
      y: formula(t),
      t: t,
      dy: E.k * formula(t)
    };
    $scope.$broadcast('move');
  };

  E.update(2);

}

function eFunDer() {
  // =====setup=====
  var M = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 20
  };

  var t = d3.scale.linear()
    .domain([0, 4]);

  var y = d3.scale.linear()
    .domain([0, 4]);

  var line = d3.svg.line()
    .x(function(d) {
      return t(d.t);
    })
    .y(function(d) {
      return y(d.y);
    });
  var line2 = d3.svg.line()
    .x(function(d) {
      return t(d[0]);
    })
    .y(function(d) {
      return y(d[1]);
    });

  function link(scope, el, attr, E) {
    var height = el[0].clientWidth - M.top - M.bottom;
    var width = el[0].clientWidth - M.left - M.right;

    var s = d3.select(el[0]).append("svg.E")
      .attr("width", width + M.left + M.right)
      .attr("height", height + M.top + M.bottom);

    var svg = s.append("g")
      .translate([M.left, M.top]);

    var clipPath = s.append('defs').append('clip-path')
      .append('rect#clipPath2')
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
        E.update(t.invert(d3.mouse(this)[0]));
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

    var main = svg.append('g.main').attr('clip-path', 'url(#clipPath2)')

    var plot = {
      funPath: main.append('path.funPath'),
      update: function() {
        this.funPath.attr('d', line(E.fun));
      }
    };

    var dot = {
      circle: main.append('circle.dot2').attr('r', 4),
      triangle: main.append('path.triangle'),
      square: main.append('path.triangle').attr({
        fill: '#999',
        opacity: 0.2
      }),
      square2: main.append('path.triangle').attr({
        fill: '#999',
        opacity: 0.2
      }),
      triData: function() {
        return [
          [E.dot.t, E.dot.y],
          [E.dot.t - E.dot.y / E.dot.dy, 0],
          [E.dot.t, 0]
        ];
      },
      squareData: function() {
        return [
          [E.dot.t, E.dot.y],
          [E.dot.t, 0],
          [E.dot.t -1, 0],
          [E.dot.t - 1, E.dot.y],
        ];
      },
      squareData2: function() {
        return [
          [E.dot.t, E.dot.dy],
          [E.dot.t, 0],
          [E.dot.t - E.dot.y / E.dot.dy, 0],
          [E.dot.t - E.dot.y / E.dot.dy, E.dot.dy],
        ];
      },
      update: function() {
        this.circle.translate([t(E.dot.t), y(E.dot.y)]);
        this.triangle.attr('d', line2(this.triData()) + 'Z');
        this.square2.attr('d', line2(this.squareData2()) + 'Z');
        this.square.attr('d', line2(this.squareData()) + 'Z');
      }
    };

    scope.$on('move', function() {
      dot.update();
    });

    scope.$on('windowResize', widthResize);

    widthResize();

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      height = el[0].clientWidth - M.top - M.bottom;
      s.attr('height', height + M.top + M.bottom);
      s.attr('width', width + M.left + M.right);
      y.range([height, 0]);
      t.range([0, width]);
      bg.attr("width", width).attr('height', height);
      tAxis.update();
      yAxis.update();
      plot.update();
      dot.update();
    }

  }

  return {
    restrict: 'A',
    link: link,
    controller: 'eCtrl',
    scope: {}
  };
}
