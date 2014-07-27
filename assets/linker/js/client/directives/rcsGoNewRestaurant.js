angular
  .module('rcs')
  .directive('rcsGoNewRestaurant', ['$state', function ($state) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.goNewRestaurant = function () {
          $state.go('newRestaurant');
        }

        $element.bind('click', $scope.goNewRestaurant);
      }
    }
  }])