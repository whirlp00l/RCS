angular
  .module('rcs')
  .controller('homeCtrl', ['$rootScope', '$scope', 'rcsSocket', 'rcsData', 'RCS_EVENTS', '$state', '$stateParams', '$window',
    function($rootScope, $scope, rcsSocket, rcsData, RCS_EVENTS, $state, $stateParams, $window){
      $window.innerHeight = 500;
      if (!rcsData.getRestaurantId()) {
        return $state.go('restaurant');
      }

      $scope.restaurantId = rcsData.getRestaurantId();
      $scope.restaurantName = rcsData.getRestaurantName();
      $scope.isDropdownOpen = false;
      $scope.editTableText = '编辑桌子';

      $rootScope.$on(RCS_EVENTS.editModeOn, function (event) {
        $scope.editTableText = '完成编辑';
        $scope.isDropdownOpen = false;
        $scope.safeApply();
      });

      $rootScope.$on(RCS_EVENTS.editModeOff, function (event) {
        $scope.editTableText = '编辑桌子';
        $scope.isDropdownOpen = false;
        $scope.safeApply();
      });


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