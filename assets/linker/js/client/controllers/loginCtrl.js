angular
  .module('rcs')
  .controller('loginCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'rcsAuth', '$state', 'handshake',
    function ($scope, $rootScope, AUTH_EVENTS, rcsAuth, $state, handshake) {
      $scope.debug = false;

      if (handshake) {
        $state.go('restaurant');
      }

      // if already logged in
      if (rcsAuth.isAuthenticated()) {
        $state.go('restaurant');
      }

      $scope.credentials = {
        email: '',
        password: ''
      };

      $scope.login = function (credentials) {
        rcsAuth.login(credentials)
          .success(function () {
            $state.go('restaurant');
          })
          .error(function () {
            alert('login failed')
          });
      };
    }]);