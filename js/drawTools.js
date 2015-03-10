function drawTools() {

  return function(svg, t, y, M) {
    var width, height;

    svg.update = function() {
      this.attr({
        width: width + M.left + M.right,
        height: height + M.left + M.right
      });
    };

    var clipID = ID();

    var clipPath = svg.append('defs').append('svg:clipPath')
      .attr('id', 'clipPath' + clipID)
      .append('rect');

    var main = main.append('g.main')
      .translate([M.left, M.top])
      .attr('clip-path', 'url(#' + clipID + ')');

    var yAxis = {
      g: main.append("g.y.axis"),
      fun: d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient("left"),
      label: main.append('g')
        .translate([5, 14])
        .append("text.label")
        .style("text-anchor", "left")
        .text("y"),
      update: function() {
        this.fun.tickSize(-width);
        this.g.call(this.fun);
      }
    };

    var tAxis = {
      g: main.append("g.t.axis"),
      fun: d3.svg.axis()
        .scale(t)
        .ticks(5)
        .orient("bottom"),
      label: main.append('g')
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

    var bg = {
      rect: svg
        .append('rect.background')
        .attr({
          rt: 4,
          ry: 4,
        })
        .on("contextmenu", function(d, i) {
          d3.event.preventDefault();
        }),
      update: function() {
        this.rect.attr({
          width: width,
          height: height
        });
      }
    };

    return {
      yAxis: yAxis,
      tAxis: tAxis,
      bg: bg,
      svg: svg,
      main: main
      update: function(width_, height_) {
        width = width_;
        height = height_;
        [this.yAxis, this.tAxis, this.bg, this.svg].forEach(function(d) {
          d.update();
        });
      }
    };
  };


}
