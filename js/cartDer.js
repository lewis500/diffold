angular.module('mainApp')
  .controller('cartCtrl', cartCtrl)
  .directive('cartDer', cartDer);

function cartCtrl($scope) {
  var C = this;

  var block = C.block = {
    m: 1,
    b: 0.3,
    k: 2,
    x0: 0,
    x: 0,
    y: 50,
    drag: function(v) {
      this.x0 = this.x = v;
      $scope.$broadcast('moveBlock');
    },
    release: function() {
      this.stop = false;
      d3.timer(function(t) {
        if (t > 6000) block.halt()
        t = t / 145;
        block.x = block.x0 * Math.exp(-block.b * t / (2 * block.m)) * Math.cos(block.wd * t);
        $scope.$broadcast('moveBlock');
        return block.stop;
      });
    },
    solve: function() {
      this.wd = Math.pow(-(Math.pow(this.b, 2) - 4 * this.m * this.k), .5) / (2 * this.m);
    },
    stop: false,
    halt: function() {
      this.stop = true;
      this.x0 = this.x;
    }
  };

  block.solve();
}

function cartDer() {

  var M = {
    top: 20,
    right: 20,
    bottom: 25,
    left: 20
  };

  function link(scope, el, attr, C) {
    var height = 120;
    var width = el[0].clientWidth - M.left - M.right;
    var x = d3.scale.linear()
      .domain([-1, 1])
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

    var block = (function() {

      var drag = d3.behavior.drag()
        .origin(function(d) {
          return {
            x: x(d.x),
            y: 0
          };
        })
        .on('dragstart', function(d, i) {
          C.block.halt()
        })
        .on('drag', function(d, i) {
          C.block.drag(x.invert(d3.event.x));
        })
        .on('dragend', function(d) {
          d.release();
        });

      var g = main.append('g.block')
        .translate([0, height / 2+10])
        .datum(C.block)
        .append('g')
        .translate([x(0), 0])
        .call(drag);

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
          this.g
            .translate([x(C.block.x), 0]);
          this.wheels
            .attr('transform', 'rotate(' + x(C.block.x) / (30 * Math.PI) * 360 + ')');
          springs.update();
        }
      };
    })();

    var springs = (function() {

      var y = d3.scale.linear()
        .domain([-1, 1])
        .range([height / 2 - 30, height / 2 + 30]);

      var xL = d3.scale.linear()
        .domain([-1, 0])

      var xR = d3.scale.linear()
        .domain([0, 1])

      var data = _.range(0, 75)
        .map(function(d) {
          var u = d / 75;
          return {
            x: u,
            y: Math.sin(2 * d * Math.PI / 10)
          };
        });

      var g = main.insert('g.spring', 'g.block');

      var lineL = d3.svg.line()
        .interpolate('cardinal')
        .x(function(d) {
          return xL(-d.x);
        }).y(function(d) {
          return y(d.y);
        });
      var lineR = d3.svg.line()
        .interpolate('cardinal')

      .x(function(d) {
        return xR(d.x);
      }).y(function(d) {
        return y(d.y);
      });

      return {
        g: g,
        lines: g.selectAll('springs')
          .data([data, data])
          .enter()
          .append('path.spring'),
        update: function() {
          xL.range([0, x(C.block.x) - 45]);
          xR.range([x(C.block.x) + 45, width]);
          this.lines.attr('d', function(d, i) {
            return i == 0 ? lineL(d) : lineR(d);
          });
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
      // xAx
      xAxis.update();
      block.move();
    }

    widthResize();

  }

  return {
    link: link,
    restrict: 'A',
    controller: 'cartCtrl',
  };

}
