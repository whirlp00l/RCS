angular
  .module('rcs')
  .controller('homeCtrl', ['$scope', 'rcsSocket', 'rcsData', '$state', '$stateParams', '$window',
    function($scope, rcsSocket, rcsData, $state, $stateParams, $window){
      $window.innerHeight = 500;
      if (!rcsData.getRestaurantId()) {
        return $state.go('restaurant');
      }

      $scope.restaurantId = rcsData.getRestaurantId();
      $scope.restaurantName = rcsData.getRestaurantName();

      rcsSocket.connect()

      // used in Ctrl inherited from homeCtrl
      $scope.safeApply = function(fn) {
        try {
          var phase = this.$root.$$phase;
          if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        }
        catch (err) {

        }
      }
    }]);