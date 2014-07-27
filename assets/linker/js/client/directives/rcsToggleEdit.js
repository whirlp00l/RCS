angular
  .module('rcs')
  .directive('rcsToggleEdit', ['$rootScope', 'RCS_EVENTS', function ($rootScope, RCS_EVENTS) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        var edit = false;
        var textToTrunOn = '编辑桌子';
        var textToTrunOff = '完成编辑';

        $scope.rcsToggleEdit = {
          text: textToTrunOn
        }

        $scope.toggleEdit = function () {
          edit = !edit;
          if (edit) {
            $scope.rcsToggleEdit.text = textToTrunOff;
            $scope.safeApply();
            $rootScope.$broadcast(RCS_EVENTS.editModeOn);
          } else {
            $scope.rcsToggleEdit.text = textToTrunOn;
            $scope.safeApply();
            $rootScope.$broadcast(RCS_EVENTS.editModeOff);
          }
        }

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

        $element.bind('click', $scope.toggleEdit);
      }
    }
  }])