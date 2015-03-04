angular.module('mainApp').directive('expFunMiddle', expFunMiddle);

function expFunMiddle() {
  // =====setup=====
  var M = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 10
  };

  var t = d3.scale.linear().domain([0, 8]).clamp(true);
  var y = d3.scale.linear().domain([0, 8]);
  var y2 = d3.scale.linear().domain([0, 8]).clamp(true);

  var line = d3.svg.line()
    .interpolate('cardinal')
    .x(function(d) {
      return t(d.t);
    })
    .y(function(d) {
      return y(d.dy);
    });

  function link(scope, el, attr) {
    var E = scope.E;
    var height = el[0].clientWidth - M.top - M.bottom;
    var width = el[0].clientWidth - M.left - M.right;

    var s = d3.select(el[0]).append("svg.exp")
      .attr("width", '100%')
      .attr("height", height + M.top + M.bottom)

    var svg = s.append("g")
      .translate([M.left, M.top]);

    var clipPath = svg.append('defs').append('clipPath')
      .attr('id','clipDy')
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
        .text("y'"),
      update: function() {
        this.fun.tickSize(-width);
        this.g.call(this.fun);
      }
    };

    var main = svg.append('g.main').attr('clip-path', 'url(#clipDy)')

    var plot = {
      derPath: main.append('path.derPath'),
      update: function() {
        this.derPath.transition('redraw').duration(75).ease('cubic-out').attr('d', line(E.fit.array));
        var last = E.fit.array[E.fit.array.length - 1];
        if(!last) return;
        this.label.translate([t(last.t), y(last.dy)]);
      },
      label: main.append('g').append('text').text("y'(t)").attr('x', 10)
    };

    var bars = {
      dyBar: main.append('rect.dyBar').attr('width', 2).translate([2, 0]),
      tBar: main.append('rect.tBar').attr('height', 2).attr('y', -3),
      tLine: main.append('line.tLine'),
      dyLine: main.append('line.dyLine'),
      drop: function(tar) {
        return tar.transition('drop').duration(120).ease('cubic-in');
      },
      appear: function(tar, o) {
        return tar.transition('appear').duration(50).attr('opacity', o);
      },
      show: function() {
        this.appear(this.tLine, .7);
        this.appear(this.dyLine, .7);
      },
      hide: function() {
        this.drop(this.dyBar).attr({
          height: 0,
          y: height
        });
        this.drop(this.tBar).attr({
          width: 0
        });
        this.appear(this.tLine, 0);
        this.appear(this.dyLine, 0);
      },
      shift: function(tar) {
        return tar.transition('shift').duration(25).ease('cubic-out');
      },
      update: function() {
        var which = E.fit.which;
        if (!which) return;
        this.shift(this.dyBar)
          .attr({
            y: y2(which.dy),
            height: height - y2(which.dy),
          });
        this.shift(this.tBar).attr({
          width: t(which.t)
        }).translate([0, height]);

        this.shift(this.dyLine).attr({
          y1: height,
          y2: y2(which.dy),
          x1: t(which.t),
          x2: t(which.t)
        });
        this.shift(this.tLine).attr({
          y1: y2(which.dy),
          y2: y2(which.dy),
          x1: 0,
          x2: t(which.t)
        });
      }
    };

    scope.$on('move', function() {
      plot.update();
      bars.update();
    });

    scope.$on('slide', function() {
      plot.update();
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
      t.range([0, width]);
      bg.attr("width", width).attr('height', height);
        clipPath.attr("width", width).attr('height', height);

      tAxis.update();
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
