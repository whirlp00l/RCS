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
        AuthService.login(credentials)
          .success(function () {
            $state.go('restaurant');
          })
          .error(function () {
            alert('login failed')
          });
      };
    }]);