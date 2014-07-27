angular
  .module('rcs')
  .controller('tableMapCtrl', ['$scope', '$http', '$modal', '$log', 'rcsSocket',
    function($scope, $http, $modal, $log, rcsSocket){

      // initial table 2d array
      $scope.maxTableRow = 10;
      $scope.maxTableCol = 12;

      $scope.tables = new Array($scope.maxTableRow);
      for (var i = 0; i < $scope.maxTableRow; i++) {
        $scope.tables[i] = new Array($scope.maxTableCol);
      }

      $scope.undefinedTable = 'undefined';
      var tableData = [];

      var updateTableData = function () {
        for (var i = 0; i < $scope.maxTableRow; i++) {
          for (var j = 0; j < $scope.maxTableCol; j++) {
            $scope.tables[i][j] = {
              row: i,
              col: j,
              current: false,
              data: $scope.undefinedTable
            }
          }
        }

        for (var i = 0; i < tableData.length; i++) {
          var row = tableData[i].MapRow;
          var col = tableData[i].MapCol;
          $scope.tables[row][col].data = tableData[i];
        }
      }

      updateTableData();

      // listen to event
      $scope.$on('tables.update', function (event) {
        $scope.requests = rcsSocket.data.tables;
        tableData = rcsSocket.data.tables;
        updateTableData();

        $scope.safeApply(function () {
          $log.debug('tableCtrl: applied tables updated');
        });
      })
    }]);