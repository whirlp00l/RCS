angular
  .module('rcs')
  .controller('newTableModalCtrl', ['$scope', '$http', '$modalInstance', 'rcsAPI', 'row', 'col', 'restaurantName',
    function($scope, $http, $modalInstance, rcsAPI, row, col, restaurantName){
      $scope.row = row;
      $scope.col = col;

      $scope.data = {
        tableName: '',
        tableType: ''
      };

      $scope.create = function (tableName, tableType) {
        if(!tableName || !tableType) {
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
        $modalInstance.dismiss('cancel');
      };
    }]);