angular
  .module('rcs')
  .controller('headerCtrl', ['$rootScope', '$scope', 'SessionService', 'rcsAuth', 'AUTH_EVENTS',
    function($rootScope, $scope, SessionService, rcsAuth, AUTH_EVENTS){

      var update = function () {
        $scope.isAuthenticated = rcsAuth.isAuthenticated();
        $scope.userEmail = SessionService.user;
        $scope.userRole = SessionService.userRole;
      };

      update();

      $rootScope.$on(AUTH_EVENTS.loginSuccess, function (event) {
        update();
      });

      $rootScope.$on(AUTH_EVENTS.logoutSuccess, function (event) {
        update();
      })

      $scope.versionText = 'v0.1.8';
    }]);