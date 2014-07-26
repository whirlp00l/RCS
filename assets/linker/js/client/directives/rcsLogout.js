angular
  .module('rcs')
  .directive('rcsLogout', ['$state', 'AuthService', 'rcsSocket', function ($state, AuthService, rcsSocket) {
    return {
      restrict: 'A',

      link: function ($scope, $element, $attr) {
        $scope.logout = function () {
          rcsSocket.disconnect();
        };

        $element.bind('click', $scope.logout);
      }
    }
  }])