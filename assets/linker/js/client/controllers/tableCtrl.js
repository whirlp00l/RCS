angular
  .module('rcs')
  .controller('tableCtrl', ['$scope', '$http', '$modal', '$log', 'rcsSocket',
    function($scope, $http, $modal, $log, rcsSocket){

      // initial table 2d array
      $scope.maxTableRow = 10;
      $scope.maxTableCol = 12;

      $scope.tables = new Array($scope.maxTableRow);
      for (var i = 0; i < $scope.maxTableRow; i++) {
        $scope.tables[i] = new Array($scope.maxTableCol);
      }

      var undefinedTable = 'undefined';
      var tableData = [];

      var updateTableData = function () {
        for (var i = 0; i < $scope.maxTableRow; i++) {
          for (var j = 0; j < $scope.maxTableCol; j++) {
            $scope.tables[i][j] = {
              row: i,
              col: j,
              current: false,
              data: undefinedTable
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

      $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
          if(fn && (typeof(fn) === 'function')) {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      };

      // click table
      // add table
      var addTable = function (table) {
        var modalInstance = $modal.open({
          templateUrl: '/template/modalNewTable',
          controller: 'newTableModalCtrl',
          size: 'sm',
          resolve: {
            col: function () {
              return table.col;
            },
            row: function () {
              return table.row;
            },
            restaurantName: function () {
              return $scope.currentRestaurant;
            }
          }
        });

        table.current = true; // TODO: add visualization

        modalInstance.result.then(function () {}, function () {
          table.current = false;
        });
      }

      var viewTable = function (tableData) {
        var modalInstance = $modal.open({
          templateUrl: '/template/modalViewTable',
          controller: 'viewTableModalCtrl',
          resolve: {
            tableData: function () {
              return tableData;
            },
            tableTypeText: function () {
              return $scope.getTableTypeText(tableData);
            },
            tableStatusText: function () {
              return $scope.getTableStatusText(tableData);
            }
          }
        });

        modalInstance.result.then(function (tableName) {
          $http.get('/table/destroy', {
            RestaurantName: "KFC",
            TableName: tableName,
            MapRow: row,
            MapCol: col
          });
        });
      }

      $scope.clickTable = function (table) {
        if (table.data == undefinedTable) {
          addTable(table);
        } else {
          viewTable(table.data);
        }
      }

      // show table
      $scope.getTableName = function(table) {
        if (table.data != undefinedTable) {
          return table.data.TableName;
        }

        return '+'
      }

      $scope.getTableStatus = function(table) {
        if (table.data == undefinedTable) {
          return '';
        }

        return table.data.Status;
      }


      $scope.getTableTypeText = function(tableData) {
        if (!tableData.TableType || tableData.TableType == '') {
          return "未指定";
        }

        return tableData.TableType;
      }

      $scope.getTableStatusText = function(tableData) {
        switch (tableData.Status) {
          case 'empty':
            return '空桌';
          case 'paying':
            return '正在支付';
          case 'paid':
            return '已支付';
          defalut:
            return tableData.Status;
        }
      }

      $scope.ifHasRequest = function (table) {
        if (table.data != undefinedTable && parseInt(table.data.RequestCount) != 0) {
          return true;
        }
        return false;
      }

      $scope.ifHasBook = function (table) {
        if (table.data == undefinedTable) {
          return false;
        }

        if (!table.data.BookDateTime || table.data.BookDateTime == '') {
          return false;
        }

        if ((new Date() - new Date(table.data.BookDateTime)) > 30*60*1000) {
          return false;
        }

        return true;
      }

      $scope.ifHasLink = function (table) {
        if (table.data == undefinedTable) {
          return false;
        }

        return (table.data.LinkTime && table.data.LinkTime != null);
      }

      $scope.getTableUpdateDurationMin = function (tableData) {
        var diff = new Date() - new Date(tableData.StatusUpdateAt);
        if (diff < 0) {
          diff = 0;
        }
        return Math.floor(diff/1000/60);
      }

      $scope.getTooltip = function (table) {
        if (table.data == undefinedTable) {
          return '';
        }

        var bookingInfo = '';
        if ($scope.ifHasBook(table)) {
          bookingInfo = (
            '<div class="rcs-table-tooltip">' +
              '预订: {0} {1}' +
            '</div>'
            ).format(
              table.data.BookName,
              new Date(table.data.BookDateTime).format('mm/dd HH:MM')
            );
        }

        var linkInfo = '<div class="rcs-table-tooltip"><i class="{0}"></i>{1}</div>'.format(
            $scope.ifHasLink(table) ? 'glyphicon glyphicon-ok' :'glyphicon glyphicon-remove',
            $scope.ifHasLink(table) ? '已关联' :'未关联'
        );

        return (
          '<div class="rcs-table-tooltip">' +
            '类型: {0}<br>状态: {1}<br>({2}分钟前更新)' +
          '</div>'
        ).format(
          $scope.getTableTypeText(table.data),
          $scope.getTableStatusText(table.data),
          $scope.getTableUpdateDurationMin(table.data)
        ) + bookingInfo + linkInfo;
      }
    }]);