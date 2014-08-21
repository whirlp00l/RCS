angular
  .module('rcs')
  .directive('rcsGoRestaurant', ['$state', function ($state) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.goRestaurant = function () {
          $state.go('restaurant');
        }

        $element.bind('click', $scope.goRestaurant);
      }
    }
  }])