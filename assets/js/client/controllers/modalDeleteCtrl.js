angular
  .module('rcs')
  .controller('modalDeleteCtrl', ['$scope', '$modalInstance', 'title', 'content',
    function($scope, $modalInstance, title, content){
      $scope.title = title;
      $scope.content = content;

      $scope.confirm = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }]);