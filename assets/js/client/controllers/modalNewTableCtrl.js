angular
  .module('rcs')
  .controller('modalNewTableCtrl', ['$scope', '$http', '$modalInstance', 'rcsAPI', 'param',
    function($scope, $http, $modalInstance, rcsAPI, param){

      // const
      $scope.tableTypes = [
        '普通', '大桌', '包间'
      ]

      // param
      $scope.row = param.row;
      $scope.col = param.col;
      $scope.restaurantId = param.restaurantId;

      // scope
      $scope.data = {
        tableName: '',
        tableType: $scope.tableTypes[0]
      };

      var cancelled = false;

      $scope.create = function (tableName, tableType) {
        if(!tableName || !tableType || cancelled) {
          return;
        }

        rcsAPI.Table.create($scope.restaurantId, tableName, tableType, $scope.row, $scope.col)
          .success(function() {
            $modalInstance.dismiss('done');
          })
          .error(function (data, status) {
            if (status === 400) {
              alert(data.validationErrors || 400);
            } else {
              alert(status);
            }
          });
      };

      $scope.cancel = function () {
        cancelled = true;
        $modalInstance.dismiss('cancel');
      };
    }]);