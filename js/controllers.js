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

    var newDatum;

    FP.addDot = function addDot(res) {
      newDatum = {
        x: res[0],
        y: res[1],
        i: (j++)
      };
      FP.data.push(newDatum);
      FP.data.sort(function(a, b) {
        return a.x - b.x;
      });
      update();
      $scope.$apply();
      $scope.$broadcast('addDot');
    };

    FP.dragRec = function(res) {
      newDatum.x = res[0];
      newDatum.y = res[1];
      FP.data.sort(function(a, b) {
        return a.x - b.x;
      });
      update();
      $scope.$apply();
      $scope.$broadcast('move');
    };

    FP.drag = function(res) {
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
    FP.derivative = [];

    function update() {
      var degree = 3;
      if (FP.data.length < degree ) return;
      var filler = _.range(FP.data[0].x, FP.data[FP.data.length - 1].x + .5, .125)
        .map(function(d) {
          return [d, null]
        });

      var newData = _.union(FP.data.map(function(d) {
        return [d.x, d.y];
      }), filler).sort(function(a, b) {
        return a[0] - b[0];
      });

      var r = regression('polynomial', newData, degree);
      FP.fit = r.points;
      FP.derivative = filler.map(function(d) {
        var res = 0;
        r.equation.forEach(function(v, i) {
          if (i == 0) return;
          res = res + (i) * v * Math.pow(d[0], i - 1)
        })
        return [d[0], res];
      });

    }

    FP.goal = _.range(0, 4, 0.125)
      .map(function(d) {
        return [d,
          1 + 1 * d - .5 * Math.pow(d, 2)
        ];
      });

  });

angular.module('mainApp')
  .controller('funCtrl', function($scope) {
    var fun = this;
    fun.equation = function(d) {
      return [d, -Math.pow(d, 2) + 4 * d];
    };
    fun.data = _.range(0, 4, .125).map(fun.equation);
    fun.point = [0, 1];
    fun.goal = 2;
  });


angular.module('mainApp')
  .controller('slopeCtrl', function($scope) {
    $scope.data = _.range(0, 4, .05).map(function(d) {
      return [d, 1.5 + .5 * Math.pow(d, 2) - 1 * d,  d - 1];
    });

    $scope.point = [0, 0, 0];

  });
