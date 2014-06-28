angular
  .module('rcs')
  .controller('newTableModalCtrl', ['$scope', '$http', '$modalInstance', 'row', 'col', 
    function($scope, $http, $modalInstance, row, col){
      $scope.row = row;
      $scope.col = col;
      
      $scope.data = {
        tableName: '',
        tableType: ''
      };

      $scope.ok = function () {
        if ($scope.data.tableName == '') {
          // message
        } else {
          $http.post('/table/create', {
            RestaurantName: "KFC",
            TableName: $scope.data.tableName,
            TableType: $scope.data.tableType,
            MapRow: $scope.row,
            MapCol: $scope.col
          }).success(function() {
            $modalInstance.dismiss('cancel');
          });
          
        }
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }]);