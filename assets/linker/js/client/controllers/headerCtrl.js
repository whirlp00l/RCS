angular
  .module('rcs')
  .controller('headerCtrl', ['$scope', 'SessionService', 'AuthService', 'AUTH_EVENTS',
    function($scope, SessionService, AuthService, AUTH_EVENTS){

      var update = function () {
        $scope.isAuthenticated = AuthService.isAuthenticated();
        $scope.userEmail = SessionService.user;
        $scope.userRole = SessionService.userRole;
      };

      update();

      $scope.$on(AUTH_EVENTS.loginSuccess, function (event) {
        update();
      });

      $scope.$on(AUTH_EVENTS.logoutSuccess, function (event) {
        update();
      })

      $scope.versionText = 'v0.1';
    }]);