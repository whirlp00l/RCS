angular
  .module('rcs')
  .controller('requestModalCtrl', ['$scope', '$modalInstance', 'request', function($scope, $modalInstance, request){
    $scope.request = request;
    
    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);