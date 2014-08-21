angular
  .module('rcs')
  .controller('tableMapCtrl', ['$rootScope', '$scope', '$http', '$modal', '$log', 'rcsData', 'RCS_EVENTS',
    function($rootScope, $scope, $http, $modal, $log, rcsData, RCS_EVENTS){

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

      $scope.isLoadingTable = true;
      updateTableData();

      // listen to event
      $rootScope.$on(RCS_EVENTS.tablesUpdate, function (event, data) {
        tableData = rcsData.getTables();
        if (tableData.length == 0) {
          $rootScope.$emit(RCS_EVENTS.editModeOn);
        }

        updateTableData();

        $log.debug('tableMapCtrl: start applying tables updated (' + (new Date() - data.startTime) + 'ms)');
        $scope.safeApply(function () {
          $log.debug('tableMapCtrl: applied tables updated (' + (new Date() - data.startTime) + 'ms)');
          $scope.isLoadingTable = false;
        });
      })

      $scope.$on('$destroy', function (argument) {
        $log.debug('tableMapCtrl: destroy');
      });

      // $scope.editMode = false;

      $rootScope.$on(RCS_EVENTS.editModeOn, function (event) {
        $scope.editMode = true;
        $scope.safeApply(function () {
          $log.debug('tableMapCtrl: get into edit mode');
        });
      });

      $rootScope.$on(RCS_EVENTS.editModeOff, function (event) {
        $scope.editMode = false;
        $scope.safeApply(function () {
          $log.debug('tableMapCtrl: get out of edit mode');
        });
      });

    }]);