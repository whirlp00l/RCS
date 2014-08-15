angular
  .module('rcs')
  .directive('rcsTable', ['$modal', 'rcsAPI', 'REQUEST_STATUS',
    function ($modal, rcsAPI, REQUEST_STATUS) {
      return {
        restrict: 'A',
        templateUrl: '/template/rcsTable',

        link: function ($scope, $element, $attr) {

          // click table
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
                param: function () {
                  return {
                    tableData: tableData,
                    editMode: $scope.editMode,
                    getTableStatusText: getTableStatusText,
                    isBooked: isBooked
                  };
                }
              }
            });
          }

          $scope.clickTable = function () {
            if ($scope.isNothing()) {
              if ($scope.editMode == true) {
                addTable($scope.table);
              }
            } else {
              viewTable($scope.table.data);
            }
          }

          // show table
          $scope.getTableName = function() {
            if ($scope.isNothing()) {
              return null;
            }

            return $scope.table.data.TableName;
          }

          $scope.getTableStatus = function() {
            if ($scope.isNothing()) {
              return null;
            }

            return $scope.table.data.Status;
          }

          var getTableStatusText = function(tableData) {
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

          $scope.getTableUpdateDurationMin = function (tableData) {
            var diff = new Date() - new Date(tableData.StatusUpdateAt);
            if (diff < 0) {
              diff = 0;
            }
            return Math.floor(diff/1000/60);
          }

          $scope.getTooltip = function (table) {
            if (table.data == $scope.undefinedTable) {
              return '';
            }

            var bookingInfo = '';
            if ($scope.isBooked(table)) {
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
                $scope.isLinked(table) ? 'glyphicon glyphicon-ok' :'glyphicon glyphicon-remove',
                $scope.isLinked(table) ? '已关联' :'未关联'
            );

            return (
              '<div class="rcs-table-tooltip">' +
                '类型: {0}<br>状态: {1}<br>({2}分钟前更新)' +
              '</div>'
            ).format(
              table.data.TableType,
              getTableStatusText(table.data),
              $scope.getTableUpdateDurationMin(table.data)
            ) + bookingInfo + linkInfo;
          }

          // check table
          $scope.isNothing = function () {
            return $scope.table.data === $scope.undefinedTable;
          }

          $scope.ifHasRequest = function () {
            if ($scope.isNothing()) {
              return false;
            }

            var tableData = $scope.table.data;
            if (!tableData.ActiveRequestCount || tableData.ActiveRequestCount == 0) {
              return false;
            }

            return true;
          }

          var isBooked = function (tableData, emptyTableDataValue) {
            if (!emptyTableDataValue && tableData === emptyTableDataValue) {
              return false;
            }

            if (!tableData.BookDateTime || tableData.BookDateTime == '') {
              return false;
            }

            if ((new Date() - new Date(tableData.BookDateTime)) > 30*60*1000) {
              return false;
            }

            return true;
          }

          $scope.isBooked = function () {
            return isBooked($scope.table.data, $scope.undefinedTable);
          }

          $scope.isLinked = function () {
            if ($scope.isNothing()) {
              return false;
            }

            var tableData = $scope.table.data;
            return (tableData.LinkTime && tableData.LinkTime != null);
          }

          $scope.isEmpty = function () {
            if ($scope.getTableStatus() != 'empty') return false;
            return true;
          }

          $scope.isServing = function () {
            if ($scope.getTableStatus() == null) return false;
            return !$scope.isEmpty() && !$scope.isPaid();
          }

          $scope.isPaid = function () {
            if ($scope.getTableStatus() != 'paid') return false;
            return true;
          }

          $element.bind('click', $scope.clickTable);
        }
      }
    }]);