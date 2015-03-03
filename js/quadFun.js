angular.module('mainApp')
  .controller('quadFunCtrl', quadFunCtrl)
  .directive('quadFunDer', quadFunDer);

function quadFunCtrl($scope) {
  var Q = this;

  function formula(t) {
    return 2 * t - 0.5 * Math.pow(t, 2);
  };

  Q.fun = _.range(0, 100).map(function(d) {
    var t = d / 25;
    return {
      t: t,
      y: formula(t)
    };
  });

  Q.sol = 1.5;

  Q.update = function(t) {
    Q.dot = {
      y: formula(t),
      t: t
    };
    $scope.$broadcast('move');
  };

  Q.update(2);

}

function quadFunDer() {
  // =====setup=====
  var M = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 20
  };

  var t = d3.scale.linear()
    .domain([0, 4])

  var y = d3.scale.linear()
    .domain([0, 2.5])

  var line = d3.svg.line()
    .x(function(d) {
      return t(d.t);
    })
    .y(function(d) {
      return y(d.y);
    });


  function link(scope, el, attr, Q) {
    // var E = scope.E;
    var width = el[0].clientWidth - M.left - M.right;
    var height = width * 0.4;

    var s = d3.select(el[0]).append("svg.quad")
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
        Q.update(t.invert(d3.mouse(this)[0]));
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
      quadPath: main.append('path.quadPath'),
      targetPath: main.append('line.target'),
      update: function() {
        this.quadPath.attr('d', line(Q.fun));
        this.targetPath
          .attr({
            x1: 0,
            x2: width,
            y1: y(Q.sol),
            y2: y(Q.sol)
          });
      }
    };


    var dot = {
      format: d3.format('.1f'),
      circle: main.append('circle.dot2').attr('r', 4),
      update: function() {
        this.circle.translate([t(Q.dot.t), y(Q.dot.y)]);
        plot.targetPath.classed('highlighted', Math.abs(Q.dot.y - Q.sol) < .025);
        this.yLine.attr({
          y1: height,
          y2: y(Q.dot.y),
          x1: t(Q.dot.t),
          x2: t(Q.dot.t)
        });
        this.tLine.attr({
          y1: y(Q.dot.y),
          y2: y(Q.dot.y),
          x1: 0,
          x2: t(Q.dot.t)
        });
        this.tLabel.text(this.format(Q.dot.t)).translate([t(Q.dot.t),height ]);
      },
      tLine: main.append('line.indicator'),
      yLine: main.append('line.indicator'),
      tLabel: main.append('text.tValue').attr("dy","-.3em").attr('dx','.1em')
    };


    scope.$on('move', function() {
      dot.update();
    });

    scope.$on('windowResize', widthResize);

    widthResize();

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      height = width * 0.6;
      s.attr('height', height + M.top + M.bottom);
      s.attr('width', width + M.left + M.right);
      y.range([height, 0]);
      t.range([0, width]);
      bg.attr("width", width).attr('height', height);
      // tLabel
      tAxis.update();
      yAxis.update();
      plot.update();
      dot.update();
    }


  }

  return {
    restrict: 'A',
    link: link,
    controller: 'quadFunCtrl',
    scope: {

    }
  };

}
