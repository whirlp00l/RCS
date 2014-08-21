angular
  .module('rcs')
  .directive('rcsEditTable', ['$rootScope', 'RCS_EVENTS', function ($rootScope, RCS_EVENTS) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        if (typeof $scope.editMode == 'undefined') {
          $scope.editMode = false;
        }

        $scope.toggleEdit = function () {
          $scope.editMode = !$scope.editMode;
          var rcsEvent = null;

          if ($scope.editMode) {
            rcsEvent = RCS_EVENTS.editModeOn;
          } else {
            rcsEvent = RCS_EVENTS.editModeOff;
          }

          $rootScope.$emit(rcsEvent);
        }

        // $scope.safeApply = function(fn) {
        //   var phase = this.$root.$$phase;
        //   if(phase == '$apply' || phase == '$digest') {
        //     if(fn && (typeof(fn) === 'function')) {
        //       fn();
        //     }
        //   } else {
        //     this.$apply(fn);
        //   }
        // }

        $element.bind('click', $scope.toggleEdit);
      }
    }
  }])