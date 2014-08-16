angular
  .module('rcs')
  .controller('menuCtrl', ['$scope', '$state', '$stateParams',
    function($scope, $state, $stateParams){

      if (!$stateParams.restaurantId) {
        var toStateName = $state.previous.state.name;
        var toStateParams = $state.previous.params;

        return $state.go(toStateName, toStateParams);
      }

      $scope.restaurantId = $stateParams.restaurantId;
    }]);