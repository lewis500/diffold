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

function expCtrl($scope, $timeout, $q) {
  var E = this;

  var Dot = {
    init: function(v) {
      _.assign(this, {
        y: v.y,
        t: v.t,
        id: ID()
      });
      return this;
    },
    change: function(v) {
      this.t = v.t;
      this.y = v.y;
      dots.getSorted();

      E.emitMove();
    }
  };

  E.goal = _.range(0, 60)
    .map(function(d) {
      return {
        dy: 0.5 * Math.exp(d / 10 * 0.5),
        t: d / 10,
        y: Math.exp(d / 10 * 0.5)
      };
    });

  E.emitMove = function() {
    $scope.$emit('move');
  };

  $scope.$watch(function() {
    return dots.C;
  }, function() {
    E.dots.slideDots();
  });

  var hilite = E.hilite = {
    show: false,
    toggleOn: function(which) {
      dots.which = which;
      fit.which = _.findLast(fit.array, function(d) {
        return d.t <= which.t;
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
      var i = this.array.indexOf(v);
      if (i == 0) return;
      this.array.splice(i, 1);
      $scope.$emit('addDot');
      hilite.toggleOff();
    },
    C: 1,
    getSorted: function() {
      this.array.sort(function(a, b) {
        return a.t - b.t;
      });
    },
    slideDots: function() {
      dots.array.forEach(function(d) {
        d.y = E.dots.C * Math.exp(0.5 * d.t);
      });
      $scope.$emit('slide');
    },
    giveAnswer: function() {
      dots.array = [];
      _.range(0, 6, .5)
        .forEach(function(d) {
          E.dots.addDot({
            t: d,
            y: Math.exp(d * 0.5)
          });
        });
      $timeout(function() {
        $scope.$emit('addDot');
        E.hilite.toggleOff();
      });
    }
  };

  var fit = E.fit = {
    refit: function(v) {
      if (!v > 0) return;
      this.array = v;
      if (!dots.which) return;
      this.which = _.find(this.array, function(d) {
        return d.t >= dots.which.t;
      });
      // if(!this.which)
    },
    array: [],
    which: null,
  };

  $timeout(function() {
    var def = $q.defer();
    var j = 0;
    for (var i = 0; i < 4; i++) {
      var newDot = {
        t: j * .5,
        y: Math.exp(j * 0.5 * 0.5)
      };
      // dots.newDatum = Object.make(Dot).init(newDot);
      // dots.array.push(dots.newDatum);
      j++;
      dots.addDot(newDot);
    }
    $timeout(function() {
      def.resolve();
    }, 750);
    return def.promise;
  }).then(function() {
    $scope.$emit('toggleOff');
  });

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
