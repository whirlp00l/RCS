angular
  .module('rcs')
  .directive('rcsLogout', ['$state', 'rcsAuth', 'rcsSocket', function ($state, rcsAuth, rcsSocket) {
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