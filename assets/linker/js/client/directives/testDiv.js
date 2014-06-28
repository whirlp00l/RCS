angular
  .module('rcs')
  .directive('testDivParent', function () {
    return {
      link: function ($scope) {
        $scope.title = 'Hello world!';
        var clickTime = 0;

        $scope.setTitle = function () {
          $scope.title = clickTime++;
        }
      }
    }
  })
  .directive('testDivChild', function () {
    return {
      scope: true,
      link: function ($scope, $element, $attr) {
        var clickTime = 0;
        $scope.setTitleChild = function () {
          $scope.title = clickTime++;
        }
      }
    }
  });