angular
  .module('rcs')
  .controller('monitorCtrl', [
    '$rootScope',
    '$scope',
    'rcsSocket',
    'rcsData',
    'rcsAPI',
    'RCS_EVENTS',
    '$state',
    '$stateParams',
    monitorCtrl]);

function monitorCtrl ($rootScope, $scope, rcsSocket, rcsData, rcsAPI, RCS_EVENTS, $state, $stateParams) {
  if (!rcsData.getRestaurantId()) {
    return $state.go('restaurant');
  }

  var restaurantId = $scope.restaurantId = rcsData.getRestaurantId();
  $scope.restaurantName = rcsData.getRestaurantName();
  $scope.isDropdownOpen = false;
  $scope.editTableText = '编辑桌子';
  $scope.safeApply = safeApply;

  $rootScope.$on(RCS_EVENTS.editModeOn, function (event) {
    $scope.editTableText = '完成编辑';
    $scope.editMode = true;
    $scope.isDropdownOpen = false;
    $scope.safeApply();
  });

  $rootScope.$on(RCS_EVENTS.editModeOff, function (event) {
    $scope.editTableText = '编辑桌子';
    $scope.editMode = false;
    $scope.isDropdownOpen = false;
    $scope.safeApply();
  });

  rcsSocket.connect();

  rcsAPI.Restaurant.listMenu(restaurantId).then(function (res) {
    rcsData.setMenuItems(res.data.Menu);
  });

  // used in Ctrl inherited from homeCtrl
  function safeApply (fn) {
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
}