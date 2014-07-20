angular
  .module('rcs')
  .controller('homeCtrl', ['$scope', 'rcsSocket', '$state', '$stateParams',
    function($scope, rcsSocket, $state, $stateParams){

      if (!$stateParams.restaurantName) {
        return $state.go('restaurant');
      }

      $scope.currentRestaurant = $stateParams.restaurantName;

      rcsSocket.connect($scope.currentRestaurant);

      // $scope.connect = function (argument) {
      //   rcsSocket.connect();
      // };

      // $scope.disconnect = function (argument) {
      //   rcsSocket.disconnect();
      // }
    }]);