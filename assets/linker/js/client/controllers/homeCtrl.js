angular
  .module('rcs')
  .controller('homeCtrl', ['$scope', 'rcsSocket', '$state', '$stateParams', '$window',
    function($scope, rcsSocket, $state, $stateParams, $window){
      $window.innerHeight = 500;
      if (typeof $stateParams.restaurantId == 'undefined') {
        return $state.go('restaurant');
      }

      $scope.restaurantId = $stateParams.restaurantId;

      rcsSocket.connect($scope.restaurantId);

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