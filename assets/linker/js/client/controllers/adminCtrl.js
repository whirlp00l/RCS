angular
  .module('rcs')
  .controller('adminCtrl', ['$scope', '$state', '$stateParams',
    function($scope, $state, $stateParams){
      console.log('adminCtrl');
      if (!$stateParams.restaurantName) {
        return $state.go('restaurant');
      }

      $scope.currentRestaurant = $stateParams.restaurantName;

      $scope.done = function () {
        var toState = 'home';
        if ($state.previous) {
          toState = $state.previous.name
        }
        $state.go(toState);
      }
    }
  ])
