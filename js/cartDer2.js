angular.module('mainApp')
  .controller('cartCtrl2', cartCtrl2)
  .directive('cartDer2', cartDer2)
  .directive('cartChart', cartChart);

function cartCtrl2($scope) {
  var C = this;
  var block = C.block = {
    b: 1,
    x: 0,
    v0: .8,
    v: 0,
    array: [],
    release: function() {
      $scope.$broadcast('release');
      block.stop = true;
      this.v = this.v0;
      C.block.x = 0;
      C.block.array = [{
        v: this.v0,
        t: 0
      }];
      var l = 0;
      _.defer(function() {
        block.stop = false;
        d3.timer(function(t) {
          t = t / 1000;
          var q = t - l
          block.v = block.v0 * Math.exp(-block.b * t);
          block.x += block.v * q;
          block.array.push({
            v: block.v,
            t: t
          });
          $scope.$broadcast('moveBlock');
          if (block.v < 0.0004) block.stop = true;
          l = t;
          return block.stop;
        });
      })
    },
    stop: false
  };

}

function cartDer2() {

  var M = {
    top: 20,
    right: 20,
    bottom: 25,
    left: 20
  };

  function link(scope, el, attr) {
    var C = scope.C;
    var height = 120;
    var width = el[0].clientWidth - M.left - M.right;
    var x = d3.scale.linear()
      .domain([0, 1])
      .range([0, width])
      .clamp(true)

    var s = d3.select(el[0]).append("svg.cart")
      .attr("width", width + M.left + M.right)
      .attr("height", height + M.top + M.bottom);

    var svg = s.append("g")
      .translate([M.left, M.top]);

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
        .ticks(10)
        .tickSize(-height)
        .orient("bottom"),
      label: svg.append('g')
        .append("text.label")
        .style("text-anchor", "middle")
        .text("x").attr('y', '1.8em'),
      update: function() {
        this.fun.tickSize(-height);
        this.g.translate([0, height]);
        this.g.call(this.fun);
        this.label.translate([width / 2, height])
      }
    };

    var main = svg.append('g.main');

    var line = d3.svg.line()
      .x(function(d) {
        return d.x;
      }).y(function(d) {
        return d.y;
      })

    var block = (function() {

      var g = main.append('g.block')
        .translate([0, height / 2 + 10])
        .datum(C.block)
        .append('g')
        .translate([x(0), 0]);

      return {
        g: g,
        rect: g.append('rect.block')
          .translate([-50, -25])
          .attr({
            width: 100,
            height: 50,
            rx: 4,
            ry: 4
          }),
        triangle: g.append('path.triangle'),
        wheels: (function() {
          var w = g.append('g.wheel')
            .translate([0, 30])
            .selectAll('wheels')
            .data([0, 1])
            .enter()
            .append('g')
            .translate(function(d) {
              return [25 * Math.pow(-1, d), 0];
            })
            .append('g')
          w.append('circle.wheel1').attr('r', 20);
          w.append('circle.wheel').attr('r', 12);
          return w;
        })(),
        move: function() {
          this.g.translate([x(C.block.x), 0]);
          this.triangle.datum([{
            x: -x(C.block.v) / 2,
            y: -height / 2
          }, {
            x: 0,
            y: 0
          }, {
            x: x(C.block.v) / 2,
            y: -height / 2,
          }, ]).attr('d', function(d) {
            return line(d) + "Z";
          });
          this.wheels.attr('transform', 'rotate(' + x(C.block.x) / (30 * Math.PI) * 360 + ')');
        }
      };
    })();

    scope.$on('windowResize', widthResize);
    scope.$on('moveBlock', function() {
      block.move();
    });

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      s.attr('width', el[0].clientWidth);
      x.range([0, width]);
      bg.attr("width", width);
      xAxis.update();
      block.move();
    }

    widthResize();

  }

  return {
    restrict: 'E',
    link: link,
  };

}

function cartChart() {
  // =====setup=====
  var M = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 20
  };

  var x = d3.scale.linear()
    .domain([0, 4])
    .clamp(true);

  var y = d3.scale.linear()
    .domain([0, 1])
    .clamp(true);

  var line = d3.svg.line()
    .x(function(d) {
      return x(d.t);
    })
    .y(function(d) {
      return y(d.v);
    });

  function link(scope, el, attr) {
    var C = scope.C;
    var height = 225;
    var width = el[0].clientWidth - M.left - M.right;

    var s = d3.select(el[0]).append("svg#cart2")
      .attr("width", '100%')
      .attr("height", height + M.top + M.bottom);

    var svg = s.append("g").translate([M.left, M.top]);

    var bg = svg.append('rect.background')
      .attr({
        height: height,
        width: width,
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

    var main = svg.append('g.main');

    var plot = {
      funPath: main.append('path.funPath'),
      update: function() {
        this.funPath
          .datum(C.block.array)
          .attr('d', line);
      },
      remake: function() {
        this.funPath.remove();
        this.funPath = main.append('path.funPath');
      }
    };

    scope.$on('moveBlock', function() {
      plot.update();
    });

    scope.$on('release', function() {
      plot.remake();
    });

    scope.$on('windowResize', widthResize);

    widthResize();

    function transform(d) {
      return 'translate(' + [x(d.x), y(d.y)] + ')'
    }

    function widthResize() {
      width = el[0].clientWidth - M.left - M.right;
      s.attr('height', height + M.top + M.bottom);
      y.range([height, 0]);
      x.range([0, width]);
      bg.attr("width", width).attr('height', height);
      xAxis.update();
      yAxis.update();
      plot.update();
    }

  }

  return {
    restrict: 'A',
    link: link
  };

}
