angular
  .module('rcs')
  .directive('rcsGoAdmin', ['$state', function ($state) {
    return {
      restrict: 'A',
      scope: {
        restaurantId: '@'
      },
      link: function ($scope, $element, $attr) {
        $scope.goAdmin = function () {
          if ($scope.restaurantId) {
            $state.go('admin', {restaurantId: $scope.restaurantId});
          }
        }

        $element.bind('click', $scope.goAdmin);
      }
    }
  }])