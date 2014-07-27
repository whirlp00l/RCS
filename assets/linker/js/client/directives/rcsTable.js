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
                tableData: function () {
                  return tableData;
                },
                tableTypeText: function () {
                  return $scope.getTableTypeText(tableData);
                },
                tableStatusText: function () {
                  return $scope.getTableStatusText(tableData);
                },
                editMode: function () {
                  return $scope.editMode;
                }
              }
            });
          }

          $scope.clickTable = function () {
            if ($scope.ifNothing()) {
              if ($scope.editMode == true) {
                addTable($scope.table);
              }
            } else {
              viewTable($scope.table.data);
            }
          }

          // show table
          $scope.getTableName = function() {
            if ($scope.ifNothing()) {
              return null;
            }

            return $scope.table.data.TableName;
          }

          $scope.getTableStatus = function() {
            if ($scope.ifNothing()) {
              return null;
            }

            return $scope.table.data.Status;
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

          // check table
          $scope.ifNothing = function () {
            return $scope.table.data == $scope.undefinedTable;
          }

          $scope.ifHasRequest = function () {
            if ($scope.ifNothing()) {
              return false;
            }

            var tableData = $scope.table.data;
            if (!tableData.Requests) {
              return false;
            }

            for (var i = tableData.Requests.length - 1; i >= 0; i--) {
              if (tableData.Requests[i].Status != REQUEST_STATUS.closed) {
                return true;
              }
            };

            return false;
          }

          $scope.ifHasBook = function () {
            if ($scope.ifNothing()) {
              return false;
            }

            var tableData = $scope.table.data;
            if (!tableData.BookDateTime || tableData.BookDateTime == '') {
              return false;
            }

            if ((new Date() - new Date(tableData.BookDateTime)) > 30*60*1000) {
              return false;
            }

            return true;
          }

          $scope.ifHasLink = function () {
            if ($scope.ifNothing()) {
              return false;
            }

            var tableData = $scope.table.data;
            return (tableData.LinkTime && tableData.LinkTime != null);
          }

          $element.bind('click', $scope.clickTable);
        }
      }
    }]);