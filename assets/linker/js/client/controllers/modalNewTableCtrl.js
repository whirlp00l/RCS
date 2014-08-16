angular
  .module('rcs')
  .controller('modalNewTableCtrl', ['$scope', '$http', '$modalInstance', 'rcsAPI', 'row', 'col', 'restaurantName',
    function($scope, $http, $modalInstance, rcsAPI, row, col, restaurantName){
      $scope.tableTypes = [
        '普通', '大桌', '包间'
      ]

      $scope.row = row;
      $scope.col = col;

      $scope.data = {
        tableName: '',
        tableType: $scope.tableTypes[0]
      };

      var cancelled = false;

      $scope.create = function (tableName, tableType) {
        if(!tableName || !tableType || cancelled) {
          return;
        }

        rcsAPI.Table.create(restaurantName, tableName, tableType, row, col)
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