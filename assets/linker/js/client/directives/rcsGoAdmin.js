angular
  .module('rcs')
  .directive('rcsGoAdmin', ['$state', function ($state) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.goAdmin = function () {
          if ($scope.currentRestaurant) {
            $state.go('admin', {restaurantName: $scope.currentRestaurant});
          }
        }

        $element.bind('click', $scope.goAdmin);
      }
    }
  }])