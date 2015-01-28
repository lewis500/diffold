angular.module('mainApp')
  .controller('funPickerCtrl', function($scope) {
    var FP = this;

    FP.data = [{
      x: 0.01,
      y: 0.01,
      i: 0
    }];

    FP.der = [];

    var bisect = d3.bisector(function(d) {
      return d.x
    }).right;

    var j = 1;

    FP.removeDot = function removeDot(d) {
      FP.data.splice(FP.data.indexOf(d), 1);
      $scope.$apply();
      $scope.$broadcast('addDot');
    };

    FP.addDot = function addDot(res) {
      FP.data.push({
        x: res[0],
        y: res[1],
        i: (j++)
      });
      FP.data.sort(function(a, b) {
        return a.x - b.x;
      });
      update();
      $scope.$apply();
      $scope.$broadcast('addDot');
    };

    FP.drag = function drag(res) {
      var i = res[2];
      FP.data[i].x = res[0];
      FP.data[i].y = res[1];
      FP.data.sort(function(a, b) {
        return a.x - b.x;
      });
      update();
      $scope.$apply();
      $scope.$broadcast('move');
    };

    FP.fit = [];

    function update() {
      var degree = 3;
      if(FP.data.length < degree+1) return;
      var filler = _.range(FP.data[0].x, FP.data[FP.data.length - 1].x + .5, .125)
        .map(function(d) {
          return [d, null]
        });

      var newData = _.union(FP.data.map(function(d) {
        return [d.x, d.y]
      }), filler).sort(function(a, b) {
        return a[0] - b[0]
      });

      FP.fit = regression('polynomial', newData, degree).points;

      // var newData2 = filler.map(function(d) {
      //   var res = 0;
      //   r.equation.forEach(function(v, i) {
      //     if (i == 0) return;
      //     res = res + (i) * v * Math.pow(d[0], i - 1)
      //   })
      //   return [d[0], res];
      // });


      // path3.datum(newData2)
      // path3.attr('d', line2)
    };

  });



angular.module('mainApp')
  .controller('funCtrl', function($scope) {
    var fun = this;

    fun.data = _.range(0, 4, .1).map(function(d) {
      return [d, Math.pow(d, 2) - 2 * d];
    });

    fun.point = [0, 1]

  });
