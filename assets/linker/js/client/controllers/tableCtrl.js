angular
  .module('rcs')
  .controller('tableCtrl', ['$scope', '$http', '$modal', 'rcsSocket',
    function($scope, $http, $modal, rcsSocket){
      console.log('tableCtrl');
      // initial table 2d array
      $scope.maxTableRow = 10; 
      $scope.maxTableCol = 12;

      $scope.tables = new Array($scope.maxTableRow);
      for (var i = 0; i < $scope.maxTableRow; i++) {
        $scope.tables[i] = new Array($scope.maxTableCol);
      }

      var undefinedTable = 'undefined';
      var resetTableMap = function (clean) {
        console.log('reset map')

        if (clean) {
          cleanTableMap();
        }

        var tables = rcsSocket.data.tables;
        for (var i = 0; i < tables.length; i++) {
          var row = tables[i].MapRow;
          var col = tables[i].MapCol;
          $scope.tables[row][col].data = tables[i];
        }

        $scope.$apply();
      }

      var cleanTableMap = function () {
        for (var i = 0; i < $scope.maxTableRow; i++) {
          for (var j = 0; j < $scope.maxTableCol; j++) {
            $scope.tables[i][j] = {
              row: i,
              col: j,
              data: undefinedTable
            }
          }
        }
      }

      cleanTableMap();

      // listen to event
      $scope.$on('tables.update', function (event, message) {
        console.log('tableCtrl: tables length = ' + rcsSocket.data.tables.length);

        if (message && message.verb == 'create') {
          var table = message.data;
          $scope.tables[table.MapRow][table.MapCol].data = table;
          $scope.$apply();
        // } else if (message && message.verb == 'update') {
          // var table = message.data;
          // if (table.RequestCount) {

          // }
          // Status
          // StatusUpdateAt
          // BookName: table.BookName,
          // BookCell: table.BookCell,
          // BookDateTime: table.BookDateTime
        } else {
          resetTableMap(!message || message.verb == 'destroy');
        }
      })

      // click table
      // add table
      var addTable = function (row, col) {
        var modalInstance = $modal.open({
          templateUrl: '/angular/modalNewTable',
          controller: 'newTableModalCtrl',
          resolve: {
            col: function () {
              return col;
            },
            row: function () {
              return row;
            }
          }
        });

        modalInstance.result.then(function (tableName) {
          $http.post('/table/create', {
            RestaurantName: "KFC",
            TableName: tableName,
            MapRow: row,
            MapCol: col
          });
        });
      }

      var viewTable = function (tableData) {
        var modalInstance = $modal.open({
          templateUrl: '/angular/modalViewTable',
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
          addTable(table.row, table.col);
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