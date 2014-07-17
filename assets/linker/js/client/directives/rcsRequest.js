angular
  .module('rcs')
  .directive('rcsRequest', function () {
    return {
      restrict: 'A',
      templateUrl: '/template/rcsRequest'
    }
  });