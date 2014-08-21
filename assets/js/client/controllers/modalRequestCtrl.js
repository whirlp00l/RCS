angular
  .module('rcs')
  .controller('modalRequestCtrl', ['$scope', '$modalInstance', 'rcsAPI', 'request',
    function($scope, $modalInstance, rcsAPI, request){
      $scope.request = request;

      $scope.closeRequest = function () {
        rcsAPI.Request.close($scope.request.id).success(function () {
          $modalInstance.close();
        })
      };

      $scope.dismiss = function () {
        $modalInstance.dismiss('cancel');
      };
    }]);