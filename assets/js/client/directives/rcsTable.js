angular
  .module('rcs')
  .directive('rcsTable', ['$modal', 'rcsAPI', 'TABLE_STATUS',
    function ($modal, rcsAPI, TABLE_STATUS) {
      return {
        restrict: 'A',
        templateUrl: '/template/rcsTable',

        link: function ($scope, $element, $attr) {

          // binding click event
          var addTable = function (table) {
            var modalInstance = $modal.open({
              templateUrl: '/template/modalNewTable',
              controller: 'modalNewTableCtrl',
              size: 'sm',
              resolve: {
                param: function () {
                  return {
                    col: table.col,
                    row: table.row,
                    restaurantId: $scope.restaurantId
                  };
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
              controller: 'modalViewTableCtrl',
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

          $element.bind('click', $scope.clickTable);

          // conditions
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

          // properties
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
              case TABLE_STATUS.empty:
                return TABLE_STATUS.emptyText;
              case TABLE_STATUS.ordering:
                return TABLE_STATUS.orderingText;
              case TABLE_STATUS.ordered:
                return TABLE_STATUS.orderedText;
              case TABLE_STATUS.paying:
                return TABLE_STATUS.payingText;
              case TABLE_STATUS.paid:
                return TABLE_STATUS.paidText;
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
              '<div class="rcs-tooltip">' +
                '类型: {0}<br>状态: {1}<br>({2}分钟前更新)' +
              '</div>'
            ).format(
              table.data.TableType,
              getTableStatusText(table.data),
              $scope.getTableUpdateDurationMin(table.data)
            ) + bookingInfo + linkInfo;
          }
        }
      }
    }]);