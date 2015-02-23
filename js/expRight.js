angular.module('mainApp')
  .directive('expFunRight', expFunRight);

function expFunRight() {
  // =====setup=====
  var M = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 10
  };

  var x = d3.scale.linear()
    .domain([0, 8])

  var y = d3.scale.linear()
    .domain([0, 8])

  var y2 = d3.scale.linear()
    .domain([0, 8]).clamp(true)

  var line = d3.svg.line()
    .interpolate('cardinal')
    .x(function(d) {
      return x(d.y);
    })
    .y(function(d) {
      return y(d.dy);
    });

  var area = d3.svg.area()
    .interpolate('cardinal')
    .x(function(d) {
      return x(d.y);
    })
    .y1(function(d) {
      return y(Math.max(d.dy, 0.5 * d.y))
    })
    .y0(function(d) {
      return y(Math.min(d.dy, 0.5 * d.y))
    })

  function link(scope, el, attr) {
    var E = scope.E;
    var height = el[0].clientWidth - M.top - M.bottom;
    var width = el[0].clientWidth - M.left - M.right;

    var svg = d3.select(el[0]).append("svg.exp")
      .attr("width", '100%')
      .attr("height", height + M.top + M.bottom)
      .append("g")
      .attr("transform", "translate(" + M.left + "," + M.top + ")");

    var s = d3.select(el[0]).select('.exp');


    var bg = svg.append('rect.background')
      .attr({
        height: height,
        rx: 4,
        ry: 4,
      });

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
        .text("y"),
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
        .text("y'"),
      update: function() {
        this.fun.tickSize(-width);
        this.g.call(this.fun);
      }
    };
    var main = svg.append('g.main').attr('clip-path', 'url(#clip)')

    var plot = {
      goalPath: main.append('path.goalPath'),
      diffPath: main.append('path.diffPath'),
      diffArea: main.append('path.diffArea'),
      update: function() {
        this.goalPath.attr('d', line(E.goal));
        this.diffArea
          .transition()
          .duration(125)
          .ease('cubic-out')
          .attr('d', area(E.fit.array));
        this.diffPath.transition().duration(100).ease('cubic-out').attr('d', line(E.fit.array));
      }
    };

    var bars = {
      dyBar: main.append('rect.dyBar').attr('width', 2).translate([2, 0]),
      yBar: main.append('rect.yBar').attr('height', 2).attr('y', -3).translate([0, height]),
      yLine: main.append('line.yLine'),
      dyLine: main.append('line.dyLine'),
      drop: function(tar) {
        return tar.transition().duration(120).ease('cubic-in');
      },
      appear: function(tar, o) {
        return tar.transition('appear').duration(50).attr('opacity', o);
      },
      show: function() {
        this.appear(this.yLine, .7);
        this.appear(this.dyLine, .7);
        plot.diffArea.transition().duration(50).attr('opacity',.2);
      },
      hide: function() {
        this.drop(this.dyBar).attr({
          height: 0,
          y: height
        });
        this.drop(this.yBar).attr({
          width: 0
        });
        this.appear(this.yLine, 0);
        this.appear(this.dyLine, 0);
        plot.diffArea.transition().duration(50).attr('opacity',0);

      },
      shift: function(tar) {
        return tar.transition().duration(25).ease('cubic');
      },
      update: function() {
        var which = E.fit.which;
        if (!which) return;
        this.shift(this.dyBar)
          .attr({
            y: y2(which.dy),
            height: height - y2(which.dy),
          });
        this.shift(this.yBar).attr({
          width: x(which.y)
        });
        this.shift(this.dyLine).attr({
          y1: height,
          y2: y2(which.dy),
          x1: x(which.y),
          x2: x(which.y)
        });
        this.shift(this.yLine).attr({
          y1: y2(which.dy),
          y2: y2(which.dy),
          x1: 0,
          x2: x(which.y)
        });
      }
    };

    scope.$on('move', function() {
      plot.update();
      bars.update();
    });

    scope.$on('addDot', function() {
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

    scope.$on('windowResize', widthResize);

    widthResize();

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      height = el[0].clientWidth - M.top - M.bottom;
      s.attr('height', height + M.top + M.bottom);
      y.range([height, 0]);
      y2.range([height, 0]);
      x.range([0, width]);
      bg.attr("width", width).attr('height', height)
      xAxis.update();
      yAxis.update();
      plot.update();
      bars.update();

    }


  }

  return {
    restrict: 'A',
    link: link
  };

}
