angular
  .module('rcs')
  .directive('rcsGoAdmin', ['$state', function ($state) {
    return {
      restrict: 'A',
      scope: {
        restaurant: '@'
      },
      link: function ($scope, $element, $attr) {
        $scope.goAdmin = function () {
          if ($scope.restaurant) {
            $state.go('admin', {restaurantName: $scope.restaurant});
          }
        }

        $element.bind('click', $scope.goAdmin);
      }
    }
  }])