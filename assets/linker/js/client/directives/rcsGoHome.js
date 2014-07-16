angular
  .module('rcs')
  .directive('rcsGoHome', ['$state', function ($state) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.goHome = function () {
          if ($scope.currentRestaurant) {
            $state.go('home', {restaurantName: $scope.currentRestaurant});
          }
        }

        $element.bind('click', $scope.goHome);
      }
    }
  }])