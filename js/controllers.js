var ID = (function() {
  var id = 0;
  return function() {
    id++;
    return id;
  };
})();

Object.make = function(a) {
  var d = Object.create(a);
  return d;
}

function expCtrl($scope) {
  var E = this;

  var Dot = {
    init: function(v) {
      _.assign(this, {
        y: v.y,
        x: v.x,
        id: ID()
      });
      return this;
    },
    change: function(v) {
      this.x = v.x;
      this.y = v.y;
      E.fit.which = _.find(E.fit.array, function(d) {
        return d.x >= v.x;
      });
      dots.getSorted();
      E.emitMove();
    }
  };

  E.goal = _.range(0, 60)
    .map(function(d) {
      return {
        dy: 0.5 * Math.exp(d / 10 * 0.5),
        x: d / 10,
        y: Math.exp(d / 10 * 0.5)
      };
    });

  E.emitMove = function() {
    $scope.$emit('move');
  }

  var hilite = E.hilite = {
    show: false,
    toggleOn: function(which) {
      dots.which = which;
      fit.which = _.findLast(fit.array, function(d) {
        return d.x <= which.x;
      });
      this.show = true;
      $scope.$emit('toggleOn');
    },
    toggleOff: function() {
      this.show = false;
      $scope.$emit('toggleOff');
    }
  };

  var dots = E.dots = {
    array: [],
    newDatum: null,
    which: null,
    addDot: function(v) {
      this.newDatum = Object.make(Dot).init(v)
      this.array.push(this.newDatum);
      this.getSorted();
      $scope.$emit('addDot');
      E.hilite.toggleOn(this.newDatum);
    },
    removeDot: function(v) {
      this.array.splice(this.array.indexOf(v), 1);
      $scope.$emit('addDot');
      hilite.toggleOff();
    },
    getSorted: function() {
      this.array.sort(function(a, b) {
        return a.x - b.x;
      });
    },
  };

  var fit = E.fit = {
    refit: function(v) {
      this.array = v;
    },
    array: [],
    which: null,
  };

}



angular.module('mainApp').controller('expCtrl', expCtrl)
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
      return [d, 1.5 + .5 * Math.pow(d, 2) - 1 * d, d - 1];
    });

    $scope.point = [0, 0, 0];

  });
