angular
  .module('rcs')
  .controller('homeCtrl', ['$scope', 'rcsSocket', '$state', '$stateParams',
    function($scope, rcsSocket, $state, $stateParams){
      console.log('homeCtrl');
      if (!$stateParams.restaurantName) {
        $state.go('restaurant');
        return;
      }

      $scope.currentRestaurant = $stateParams.restaurantName;

      rcsSocket.connect();

      // $scope.connect = function (argument) {
      //   rcsSocket.connect();
      // };

      // $scope.disconnect = function (argument) {
      //   rcsSocket.disconnect();
      // }
    }]);