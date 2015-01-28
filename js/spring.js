function springSystem() {

  function link(scope, el, attr) {
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
      },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    var x = d3.scale.linear()
      .range([0, width])
      .domain([-1, 1])
      .clamp(true)

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var svg = d3.select(el[0]).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var main = svg.append('g').attr("class", 'main');

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("s")

    var drag = d3.behavior.drag()
      .on('dragstart', function() {
        d3.event.sourceEvent.stopPropagation();

        mass.stop = true;
        mass.solve();
      })
      .on('drag', function() {
        // mass.s0 = d3.event.x;
        mass.move(x.invert(d3.event.x));
        mass.s0 = x.invert(d3.event.x);
      })
      .on('dragend', function() {
        mass.stop = false;
        d3.timer(function(t) {
          mass.update(t/100);
          return mass.stop;
        });
      });

    var mass = {
      m: 1,
      b: 0.3,
      k: 2,
      s0: 0,
      block: main.append('rect')
        .attr({
          class: 'block',
          x: x(0),
          y: height / 2,
          fill: 'crimson',
          width: 50,
          height: 50,
          transform: 'translate(' + [-25, -25] + ')'
        })
        .attr('class', 'mass')
        .call(drag),
      solve: function() {
        this.wd = Math.pow(-(Math.pow(this.b, 2) - 4 * this.m * this.k), .5) / (2 * this.m);
      },
      update: function(t) {
        var s = this.s0 * Math.exp(-this.b * t / (2 * this.m)) * Math.cos(this.wd * t);
        this.move(s);
      },
      move: function(s) {
        this.block.attr({
          x: x(s)
        });
      },
      stop: false
    };


    mass.solve();

    mass.block.datum(mass);

  }


  return {
    link: link,
    restrict: 'A'
  };


}



angular.module('mainApp')
  .directive('springSystem', springSystem)
