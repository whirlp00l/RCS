angular
  .module('rcs')
  .directive('rcsTable', function () {
    return {
      restrict: 'A',
      templateUrl: '/template/rcsTable'
    }
  });