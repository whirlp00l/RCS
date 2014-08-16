angular
  .module('rcs')
  .directive('rcsEditMenu', ['$state', function ($state) {
    return {
      restrict: 'A',
      scope: {
        restaurantId: '@'
      },
      link: function ($scope, $element, $attr) {
        $scope.goMenu = function () {
          if ($scope.restaurantId) {
            $state.go('menu', {restaurantId: $scope.restaurantId});
          }
        }

        $element.bind('click', $scope.goMenu);
      }
    }
  }])