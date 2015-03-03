angular.module('mainApp')
  .directive('sliderDer', sliderDer);

function sliderDer() {

  function link(scope, el, attr, ngModel) {
    var slider = $(el);
    var init = function() {
      slider.noUiSlider({
        start: ngModel.$viewValue,
        range: {
          'min': +attr.min,
          'max': +attr.max
        },
        step: +attr.step
      }).on('slide', function() {
        ngModel.$setViewValue(+slider.val());
      }).on('set', function() {
        scope.E.hilite.toggleOff();
      })

      // slider.noUiSlider_pips({
      //   mode: 'range',
      //   density: 3
      // });
    };
    ngModel.$render = function() {
      init();
      slider.val(ngModel.$viewValue);
      init = angular.noop;
    };
  }

  return {
    link: link,
    require: 'ngModel'
  }

}
