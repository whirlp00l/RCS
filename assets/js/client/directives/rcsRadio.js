angular
  .module('rcs')
  .directive('rcsRadio', [function () {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function ($scope, $element, $attr, ngModelCtrl) {
        $element.iCheck({
          checkboxClass: 'icheckbox_square-red',
          radioClass: 'iradio_square-red',
          increaseArea: '20%' // optional
        });

        $element.on('ifChecked', function(event){
          ngModelCtrl.$setViewValue($attr.value);
          $scope.safeApply();
        });

        $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
          if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        }
      }
    }
  }])