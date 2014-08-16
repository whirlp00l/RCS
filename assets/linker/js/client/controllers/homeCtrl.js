angular
  .module('rcs')
  .controller('homeCtrl', ['$scope', 'rcsSocket', '$state', '$stateParams', '$window',
    function($scope, rcsSocket, $state, $stateParams, $window){
      $window.innerHeight = 500;
      if (!$stateParams.restaurantName) {
        return $state.go('restaurant');
      }

      $scope.currentRestaurant = $stateParams.restaurantName;
      $scope.restaurantId = 21;

      rcsSocket.connect($scope.currentRestaurant);

      // used in Ctrl inherited from homeCtrl
      $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
          if(fn && (typeof(fn) === 'function')) {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      }
    }]);