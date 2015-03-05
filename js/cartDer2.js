angular.module('mainApp')
  .controller('cartCtrl2', cartCtrl2)
  .directive('cartDer2', cartDer2)
  .directive('cartChart', cartChart);

function cartCtrl2($scope, $timeout) {
  var C = this;
  var block = C.block = {
    b: 1,
    x: 0,
    v0: .8,
    v01: .8,
    v: 0,
    array: [],
    release: function() {
      C.block.stop = true;
      C.block.v0 = C.block.v = C.block.v01;
      C.block.x = 0;
      C.block.array = [];
      $scope.$broadcast('moveBlock');
      $timeout(function() {
        C.block.stop = false;
        var l = 0;
        d3.timer(function(t) {
          t = t / 1000;
          var delT = t - l
          C.block.v = C.block.v0 * Math.exp(-C.block.b * t);
          C.block.x += C.block.v * delT;
          C.block.array.push({
            v: C.block.v,
            t: t
          });
          if (C.block.stop) C.block.array = [];
          if (C.block.v < 0.0004) C.block.stop = true;
          l = t;
          $scope.$broadcast('moveBlock');
          return C.block.stop;
        });
      }, 25);
    },
    stop: false
  };

}

function cartDer2() {

  var M = {
    top: 20,
    right: 35,
    bottom: 30,
    left: 10
  };

  function link(scope, el, attr) {
    var C = scope.C;
    var height = 225;
    var width = el[0].clientWidth - M.left - M.right;
    var x = d3.scale.linear()
      .domain([-.1, 1])
      .range([0, width])
      .clamp(true)

    var s = d3.select(el[0]).append("svg.cart")
      .attr("width", width + M.left + M.right)
      .attr("height", height + M.top + M.bottom);

    var svg = s.append("g")
      .translate([M.left, M.top]);

    var clipPath = svg.append("svg:clipPath")
      .attr('id', 'clipPathG')
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
        .text("x (cm)").attr('y', '1.8em'),
      update: function() {
        this.fun.tickSize(-height);
        this.g.translate([0, height]);
        this.g.call(this.fun);
        this.label.translate([width / 2, height])
      }
    };

    var main = svg.append('g.main').attr('clip-path', 'url(#clipPathG)');

    var line = d3.svg.line()
      .x(function(d) {
        return d.x;
      }).y(function(d) {
        return d.y;
      })

    var block = (function() {

      var g = main.append('g.block')
        .translate([0, height - 50])
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
        // triangle: g.append('path.triangle'),
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
          // this.triangle.datum([{
          //   x: -x(C.block.v) / 2,
          //   y: -height / 2
          // }, {
          //   x: 0,
          //   y: 0
          // }, {
          //   x: x(C.block.v) / 2,
          //   y: -height / 2,
          // }, ]).attr('d', function(d) {
          //   return line(d) + "Z";
          // });
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
      clipPath.attr('width', width);
      xAxis.update();
      block.move();
    }

    widthResize();

  }

  return {
    restrict: 'A',
    link: link,
  };

}

function cartChart() {
  // =====setup=====
  var M = {
    top: 20,
    right: 10,
    bottom: 30,
    left: 20
  };

  var x = d3.scale.linear()
    .domain([0, 4])
    .clamp(true);

  var y = d3.scale.linear()
    .domain([0, 1.1])
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
        .text("t"),
      update: function() {
        this.fun.tickSize(-height);
        this.g.translate([0, height]);
        this.g.call(this.fun);
        this.label.translate([width - 30, height - 5])
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
        .text("v (cm/sec)"),
      update: function() {
        this.fun.tickSize(-width);
        this.g.call(this.fun);
      }
    };

    var main = svg.append('g.main');

    var plot = {
      funPath: main.append('path.funPath'),
      update: function() {
        if (!this.funPath) return;
        this.funPath.attr('d', line(C.block.array));
      },
      changeV: function() {
        this.v0.translate([0, y(C.block.v01)]);
      },
      v0: (function() {
          var g = main.append('g.v0')
          g.append('line')
            .attr({
              x1: 0,
              x2: 4,
              stroke: 'black',
              'stroke-width': 2
            });
          g.append('rect').attr({
            width: 23,
            height: 21,
            rx: 3,
            ry: 3,
            opacity: .4,
            fill: '#fff',
            x: 2,
            y: -9
          })
          var t = g.append('text').attr({
            'x': 6,
            y: 3
          })
          .append('tspan');
          t.text('v');
          t.append('tspan').attr('baseline-shift', 'sub').text('0');
          return g;
        })()
        // v0: main.append('g.v0').append('text').text('v\u2080')
    };


    scope.$on('moveBlock', function() {
      plot.update();
    });

    scope.$watch(function() {
      return C.block.v01;
    }, function() {
      plot.changeV();
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
