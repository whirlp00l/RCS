angular
  .module('rcs')
  .controller('loginCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService', '$state',
    function ($scope, $rootScope, AUTH_EVENTS, AuthService, $state) {
      console.log('loginCtrl');
      
      $scope.role = 'N/A';

      $scope.credentials = {
        email: '',
        password: ''
      };

      $scope.login = function (credentials) {
        AuthService.login(credentials).then(function () {
          // $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
          $state.go('restaurant');
        }, function () {
          // $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
          alert('login failed')
        });
      };

      // $scope.checkRole = function () {
      //   AuthService.checkRole().then(function (res) {
      //     console.log(res);
      //     $scope.role = res.data.role;
      //   }, function () {
      //     $scope.role = 'auth failed';
      //   })
      // }
    }])
  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    manager: 'owner'
  });