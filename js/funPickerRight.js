function funPickerRight() {

  // =====setup=====
  var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    },
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var x = d3.scale.linear()
    .range([0, width])
    .domain([0, 4])
    .clamp(true)

  var y = d3.scale.linear()
    .range([height, 0])
    .domain([0, 4])
    .clamp(true)

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    .x(function(d) {
      return x(d.x)
    })
    .y(function(d) {
      return y(d.y)
    })

  var line2 = d3.svg.line()
    .x(function(d) {
      return x(d[0])
    })
    .y(function(d) {
      return y(d[1])
    })

  return {
    scope: {
      data: '=data'
    },
    restrict: 'A',
    link: function(scope, el, attr) {

      var svg = d3.select(el[0])
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("x");

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("y");

      var main = svg.append('g')
        .attr("class", 'main');

      var drag = d3.behavior.drag()
        .on('dragstart', function(d) {
          d3.event.sourceEvent.stopPropagation(); // silence other listeners
          var loc = d3.mouse(this);
          var res = [x.invert(d3.event.x), y.invert(d3.event.y)];
          scope.addDot(res);
        })
        .on('drag', function(d) {
          var res = [x.invert(d3.event.x), y.invert(d3.event.y)];
          scope.drag(res);
          scope.$emit('move');
        })
        // .on('dragend', function(d) {
        //   scope.$apply(function() {
        //     scope.update();
        //   });
        //   d3.event.sourceEvent.stopPropagation(); // silence other listeners
        // });

      var drag2 = d3.behavior.drag()
        .on('dragstart', function(d) {
          d3.event.sourceEvent.stopPropagation(); // silence other listeners
        })
        .on('drag', function(d) {
          if (d3.event.sourceEvent.which == 3) return;
          scope.$apply(function() {
            scope.data[d.i].x = d3.min([d3.max([x.invert(d3.event.x), (scope.data[d.i - 1] ? scope.data[d.i - 1].x : 0)]), (scope.data[d.i + 1] ? scope.data[d.i + 1].x : Infinity)]);
            scope.data[d.i].y = y.invert(d3.event.y);
            scope.update();
          });
          scope.$emit('move');
        })
        .on('dragend', function(d) {
          scope.$apply(function() {
            scope.update();
          });
          d3.event.sourceEvent.stopPropagation(); // silence other listeners
        });

      var bg = main.append('rect')
        .attr({
          width: width,
          height: height,
          opacity: 0,
        })
        .call(drag);

      var path = main.append('path')
        .attr({
          'stroke-width': 1,
          fill: 'none',
          'stroke': '#555',
          'stroke-dasharray': '2,2'
        });

      var path2 = main.append('path')
        .attr({
          'stroke-width': 1,
          fill: 'none',
          'stroke': '#19B5FE',
          'stroke-dasharray': '5,1,2'
        });

      // var path3 = main.append('path')
      //   .attr({
      //     'stroke-width': 2,
      //     fill: 'none',
      //     class: 'der',
      //     opacity: 0.5,
      //     'stroke': '#F7CA18',
      //     // 'stroke-dasharray': '
      //   });

      var dots;

      scope.$on('move', function(d) {
        if (!scope.data) return;
        dots.data(scope.data)
          .attr('transform', function(d) {
            return 'translate(' + [x(d.x), y(d.y)] + ')'
          });
        path.datum(scope.data)
          .attr('d', line);
      });

      scope.$on('addDot', function() {
        dots = main.selectAll('.dot')
          .data(scope.data, function(d) {
            return d.i;
          });

        var newD = dots.enter()
          .append('g')
          .attr({
            class: 'dot',
            transform: function(d) {
              return 'translate(' + [x(d.x), y(d.y)] + ')'
            }
          })
          .call(drag2)
          .on("contextmenu", function(d, i) {
            //handle right click
            scope.$apply(function() {
              scope.data.splice(d.i, 1);
              scope.data.forEach(function(v, j) {
                v.i = j
              });
            });
            //stop showing browser menu
            d3.event.preventDefault();
            scope.$emit('move')
          });

        newD.append('circle')
          .attr({
            r: 4,
          });

        newD.append('circle')
          .attr({
            r: 8,
            'fill-opacity': 0.03,
            fill: "crimson",
            stroke: 'red',
            'stroke-width': '1',
            'stroke-opacity': .03
          })
          .on('mouseover', function(d) {
            d3.select(this)
              .transition()
              .ease('cubic-out')
              .attr('fill-opacity', .05)
              .attr('r', 13)
          })
          .on('mouseout', function(d) {
            d3.select(this)
              .transition()
              .ease('cubic')
              .duration(100)
              .attr('r', 15)
              .transition()
              .duration(350)
              .ease('cubic-out')
              .attr('fill-opacity', .03)
              .attr('r', 8)
          })

        dots.exit().remove();

        path.datum(scope.data)
          .attr('d', line);
        // update();
      });

    }
  };

}

angular.module('mainApp')
  .directive('funPickerRight', funPickerRight);
