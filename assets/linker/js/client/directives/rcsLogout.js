angular
  .module('rcs')
  .directive('rcsLogout', ['$state', 'AuthService', 'rcsSocket', function ($state, AuthService, rcsSocket) {
    return {
      restrict: 'A',

      link: function ($scope, $element, $attr) {
        $scope.logout = function () {
          rcsSocket.disconnect();
          AuthService.logout().then(function () {
            $state.go('login');
          }, function () {
            console.log('logout failed')
            $state.go('login');
          })
        };

        $element.bind('click', $scope.logout);
      }
    }
  }])