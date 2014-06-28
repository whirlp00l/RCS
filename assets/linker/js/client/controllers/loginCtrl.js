angular
  .module('rcs')
  .controller('loginCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService',
    function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
      $scope.credentials = {
        username: '',
        password: ''
      };
      $scope.login = function (credentials) {
        AuthService.login(credentials).then(function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        }, function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
      };
    }]);