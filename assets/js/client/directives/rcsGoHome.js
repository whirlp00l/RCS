angular
  .module('rcs')
  .directive('rcsGoHome', ['$state', function ($state) {
    return {
      restrict: 'A',
      scope: {
        restaurantId: '@'
      },
      link: function ($scope, $element, $attr) {
        $scope.goHome = function () {
          if ($scope.restaurantId) {
            $state.go('home', {restaurantId: $scope.restaurantId});
          }
        }

        $element.bind('click', $scope.goHome);
      }
    }
  }])