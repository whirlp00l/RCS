angular
  .module('rcs')
  .directive('rcsGoHome', ['$state', function ($state) {
    return {
      restrict: 'A',
      scope: {
        restaurant: '@'
      },
      link: function ($scope, $element, $attr) {
        $scope.goHome = function () {
          if ($scope.restaurant) {
            $state.go('home', {restaurantName: $scope.restaurant});
          }
        }

        $element.bind('click', $scope.goHome);
      }
    }
  }])