angular
  .module('rcs')
  .directive('breadcrumb', ['$state', '$stateParams', '$interpolate', breadcrumb])
  .directive('rcsTable', ['$rootScope', '$materialDialog', 'rcsSession', 'makeOrderGroupFilter', 'makeArrayTextFilter', 'RCS_EVENT', 'TABLE_STATUS', rcsTable])
  .directive('rcsRequest', ['$materialDialog', 'rcsSession', 'makeOrderGroupFilter', 'makeArrayTextFilter', 'REQUEST_STATUS', 'REQUEST_TYPE', 'PAY_TYPE', rcsRequest]);

// directives
function breadcrumb ($state, $stateParams, $interpolate) {
  return {
    link: link,
    restrict: 'E',
    templateUrl: '/template/directive-breadcrumb',
    replace: true
  };

  function link ($scope, $element, $attrs) {
    return $scope.$watch((function() {
      return $state.current;
    }), function(current) {
      var states, title, _ref, _ref1;
      states = [];
      while (current != null) {
        title = ($interpolate((_ref = (_ref1 = current.data) != null ? _ref1.title : void 0) != null ? _ref : ''))($stateParams);
        if (title !== '') {
          states.push(angular.extend({
            title: title
          }, current));
        }
        current = current.parent;
      }
      states.reverse();
      return $scope.states = states;
    });
  }
}

function rcsTable ($rootScope, $materialDialog, rcsSession, makeOrderGroupFilter, makeArrayTextFilter, RCS_EVENT, TABLE_STATUS) {
  return {
    link: link,
    $scope: {
      editingTable: '=',
      simpleToast: '&',
      safeApply: '&'
    },
    restrict: 'E',
    templateUrl: '/template/directive-rcsTable',
    replace: false
  };

  function link ($scope, $element, $attrs) {
    // scope fields
    $scope.table = null;

    // scope methods
    $scope.clickManageTable = clickManageTable;
    $scope.clickEditTable = clickEditTable;
    $scope.ifNull = ifNull;
    $scope.ifEmpty = ifEmpty;
    $scope.ifServing = ifServing;
    $scope.ifPaid = ifPaid;
    $scope.ifLinked = ifLinked;
    $scope.ifBooked = ifBooked;
    $scope.ifHasRequest = ifHasRequest;
    $scope.getTableName = getTableName;
    $scope.getTooltip = getTooltip;

    // locals
    var mapRow = $scope.$parent.$index;
    var mapCol = $scope.$index;
    var getTable = getTable;
    var getTableStatusText = getTableStatusText;
    var getTableUpdateDurationMin = getTableUpdateDurationMin;
    var tableEvent = '{0}({1},{2})'.format(RCS_EVENT.tableUpdate, mapRow, mapCol);
    var toastTable = toastTable;
    var errorAction = errorAction;

    // events
    $rootScope.$on(tableEvent, initializeTable)

    // initialize
    initializeTable();

    // defines
    function toastTable (operationText, table) {
      $scope.simpleToast('{0}: <b>{1}</b> ({2})'.format(operationText, table.TableName, table.TableType), 1500);
    }

    function errorAction (res, status) {
      if (status === 400) {
        alert(res || 400);
      } else {
        alert(status);
      }
    }

    function initializeTable () {
      $scope.table = rcsSession.getTable(mapRow, mapCol);
      $scope.safeApply();
    }

    function clickManageTable (event) {
      if ($scope.ifNull()) return;

      var tableScope = $scope;
      var dialogManageTable = {
        templateUrl: 'template/dialog-manageTable',
        targetEvent: event,
        controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
          // scope fields
          $scope.selectedIndex = 0;
          $scope.table = angular.copy(tableScope.table);
          $scope.orderItems = makeOrderGroupFilter(
            $scope.table.OrderItems,
            rcsSession.getMenuItems());
          $scope.newBook = {
            name: '',
            cell: '',
            date: new Date(),
            time: getMidOfNextHour()
          };
          $scope.minDate = new Date();
          $scope.hstep = 1;
          $scope.mstep = 5;
          $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
          $scope.format = $scope.formats[1];

          // scope methods
          $scope.clickBook = clickBook;
          $scope.clickCancel = clickCancel;
          $scope.clickReset = clickReset;
          $scope.clickUnbook = clickUnbook;
          $scope.clickUnlink = clickUnlink;
          $scope.getBookingInfo = getBookingInfo;
          $scope.getLinkingInfo = getLinkingInfo;
          $scope.getOrderInfo = getOrderInfo;
          $scope.getTableStatusText = getTableStatusText;
          $scope.ifBooked = ifBooked;
          $scope.ifDisableBook = ifDisableBook;
          $scope.ifLinked = ifLinked;

          // locals
          var getMidOfNextHour = getMidOfNextHour;

          // defines
          function getMidOfNextHour () {
            var time = new Date();
            time.setHours(time.getHours() + 1);
            time.setMinutes(30);
            time.setSeconds(0);
            return time;
          }

          function getBookingInfo () {
            if (!$scope.ifBooked()) {
              return '[无]';
            }

            return '[{0}]'.format($scope.table.BookName);
          }

          function getOrderInfo () {
            if (!$scope.table.OrderItems) {
              return '[无]';
            }

            return '[{0}]'.format($scope.table.OrderItems.length);
          }

          function getLinkingInfo () {
            if (!$scope.ifLinked()) {
              return '未关联平板';
            }

            return '已关联平板[{0}]'.format($scope.table.LinkedTabletId);
          }

          function ifDisableBook () {
            var newBook = $scope.newBook;
            if (!newBook.name || !newBook.cell || !newBook.date || !newBook.time) {
              return true;
            }

            return false;
          }

          function clickReset () {
            rcsSession.resetTable($scope.table, function success (resTable) {
              $hideDialog();
              toastTable('翻桌', resTable);
            }, errorAction);
          }

          function clickUnlink () {
            rcsSession.unlinkTable($scope.table, function success (resTable) {
              $scope.table = resTable;
              toastTable('解除关联', resTable);
            }, errorAction);
          }

          function clickBook () {
            if ($scope.ifDisableBook()) return;

            var newBook = $scope.newBook;
            var newBookDateTime = new Date('{0}T{1}Z'.format(
              newBook.date.format('yyyy-mm-dd'),
              newBook.time.format('HH:MM:00', true)
            ));

            rcsSession.bookTable(
              $scope.table, newBook.name, newBook.cell, newBookDateTime,
              function success (resTable) {
                $scope.table = resTable;
                toastTable('预订', resTable);
                $scope.newBook = {
                  name: '',
                  cell: '',
                  date: new Date(),
                  time: getMidOfNextHour()
                };
              }, errorAction);
          }

          function clickUnbook () {
            rcsSession.unbookTable($scope.table, function success (resTable) {
              $scope.table = resTable;
              toastTable('取消预订', resTable);
            }, errorAction);
          }

          function clickCancel () {
            $hideDialog();
          }
        }]
      };

      $materialDialog(dialogManageTable);
    }

    function clickEditTable(event) {
      if ($scope.ifNull()) {
        var tableScope = $scope;
        var dialogCreateTable = {
          templateUrl: 'template/dialog-createTable',
          targetEvent: event,
          controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
            // scope fields
            $scope.newTable = { name:null, type:'普通' };

            // scope methods
            $scope.clickCancel = clickCancel;
            $scope.clickCreate = clickCreate;
            $scope.ifDisableCreate = ifDisableCreate;

            // defines
            function clickCreate () {
              if ($scope.ifDisableCreate()) return;

              var newTable = $scope.newTable;
              rcsSession.createTable(mapRow, mapCol, newTable.name, newTable.type,
                function success (resTable) {
                  $hideDialog();
                  toastTable('添加餐桌', resTable);
                }, errorAction);
            }

            function clickCancel () {
              $hideDialog();
            }

            function ifDisableCreate () {
              var newTable = $scope.newTable;
              return !newTable.name || !newTable.type;
            }
          }]
        };

        $materialDialog(dialogCreateTable);
      } else {
        var tableScope = $scope;
        var table = angular.copy(tableScope.table);

        var dialogDelete = {
          templateUrl: 'template/dialog-deleteTemplate',
          targetEvent: event,
          controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
            // scope fields
            $scope.deleteFrom = '餐桌';
            $scope.deleteItem = table.TableName + '(' + table.TableType + ')';

            // scope methods
            $scope.clickCancel = clickCancel;
            $scope.clickDelete = clickDelete;

            // defines
            function clickDelete () {
              $hideDialog();
              rcsSession.deleteTable(table,
                function success () {
                  toastTable('删除餐桌', table);
                }, errorAction);
            }

            function clickCancel () {
              $hideDialog();
            }
          }]
        };
        $materialDialog(dialogDelete);
      }
    }

    function ifNull () {
      return !$scope.table;
    }

    function ifEmpty () {
      return $scope.table && $scope.table.Status == TABLE_STATUS.empty;
    }

    function ifServing () {
      !$scope.ifEmpty() && !$scope.ifPaid()
      return $scope.table && !$scope.ifEmpty() && !$scope.ifPaid();
    }

    function ifPaid () {
      return $scope.table && $scope.table.Status == TABLE_STATUS.paid;
    }

    function ifLinked () {
      if ($scope.ifNull()) {
        return false;
      }

      var table = $scope.table;
      return (table.LinkTime && table.LinkTime != '');
    }

    function ifBooked () {
      var table = $scope.table;

      if ($scope.ifNull() || !table.BookDateTime || table.BookDateTime == '') {
        return false;
      }

      if ((new Date() - new Date(table.BookDateTime)) > 30*60*1000) {
        return false;
      }

      return true;
    }

    function ifHasRequest () {
      if ($scope.ifNull()) {
        return false;
      }

      var table = $scope.table;
      return table.ActiveRequestCount && table.ActiveRequestCount != 0;
    }

    function getTableName () {
      if ($scope.ifNull()) return '';
      return $scope.table.TableName;
    }

    function getTooltip () {
      if ($scope.ifNull()) {
        return null;
      }

      table = $scope.table;

      var bookingInfo = '';
      if ($scope.ifBooked()) {
        bookingInfo = (
          '<br><div class="rcs-tooltip">' +
            '预订: {0}<br>{1}' +
          '</div>'
          ).format(
            table.BookName,
            new Date(table.BookDateTime).format('mm/dd HH:MM')
          );
      }

      var linkInfo =
        '<br><div class="rcs-tooltip"><i class="{0}"></i>{1}</div>'.format(
          $scope.ifLinked() ? 'fa fa-link' :'fa fa-unlink',
          $scope.ifLinked() ? '&nbsp;已关联' :'&nbsp;未关联');

      return (
        '<div class="rcs-tooltip">' +
          '类型: {0}<br>状态: {1}<br>({2}分钟前更新)' +
        '</div>'
      ).format(
        table.TableType,
        getTableStatusText(),
        getTableUpdateDurationMin()
      ) + bookingInfo + linkInfo;
    }

    function getTableStatusText () {
      if ($scope.ifNull()) {return null;}

      var table = $scope.table;
      switch (table.Status) {
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
          return table.Status;
      }
    }

    function getTableUpdateDurationMin () {
      if ($scope.ifNull()) {return null;}

      var table = $scope.table;
      var diff = new Date() - new Date(table.StatusUpdateAt);
      if (diff < 0) {
        diff = 0;
      }
      return Math.floor(diff/1000/60);
    }
  }
}

function rcsRequest ($materialDialog, rcsSession, makeOrderGroupFilter, makeArrayTextFilter, REQUEST_STATUS, REQUEST_TYPE, PAY_TYPE) {
  return {
    link: link,
    $scope: {
      request: '=',
      simpleToast: '&',
      safeApply: '&'
    },
    restrict: 'E',
    templateUrl: '/template/directive-rcsRequest',
    replace: false
  };

  function link ($scope, $element, $attrs) {
    // scope fields
    $scope.requestStatus = REQUEST_STATUS;
    $scope.requestType = REQUEST_TYPE;

    // scope methods
    $scope.clickRequest = clickRequest;
    $scope.getRequestAdditionalText = getRequestAdditionalText;
    $scope.getRequestText = getRequestText;
    $scope.getTooltip = getTooltip;
    $scope.ifImportant = ifImportant;

    // locals
    var processRequest = processRequest;
    var closeRequest = closeRequest;
    var viewRequest = viewRequest;
    var getRequestTypeText = getRequestTypeText;
    var getRequestCreateDurationText = getRequestCreateDurationText;
    var toastRequest = toastRequest;
    var errorAction = errorAction;

    // defines
    function toastRequest (operationText) {
      var text = '{0}: <b>{1}</b> {2}'.format(
          operationText,
          $scope.request.Table.TableName,
          getRequestText());

      if (getRequestAdditionalText()) {
        text += ' ({0})'.format(getRequestAdditionalText());
      }

      $scope.simpleToast(text, 1500);
    }

    function errorAction (res, status) {
      if (status === 400) {
        alert(res || 400);
      } else {
        alert(status);
      }
    }

    function clickRequest (event) {
      switch ($scope.request.Status) {
        case REQUEST_STATUS.new:
          processRequest(event, true);
          break;
        case REQUEST_STATUS.inProgress:
          closeRequest(event, true);
          break;
        case REQUEST_STATUS.closed:
          processRequest(event, false);
          break;
      }
    }

    function processRequest (event, allowAction) {
      switch ($scope.request.Type) {
        case REQUEST_TYPE.order:
          var requestScope = $scope;
          var dialogViewRequestOrder = {
            templateUrl: 'template/dialog-viewRequestOrder',
            targetEvent: event,
            controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
              // scope fields
              $scope.request = angular.copy(requestScope.request);
              $scope.orderItems = makeOrderGroupFilter(
                requestScope.request.OrderItems,
                rcsSession.getMenuItems());
              $scope.allowAction = allowAction;
              $scope.justClick = false;

              // scope methods
              $scope.clickConfirmOrder = function() {
                if (!allowAction) return;

                if ($scope.justClick == true) return;

                $scope.justClick = true;

                var request = $scope.request;

                rcsSession.closeRequest(request,
                  function success () {
                    $scope.justClick = false;
                    $hideDialog();
                    toastRequest('关闭请求');
                  },
                  function error () {
                    $scope.justClick = false;
                    errorAction();
                  });
              };

              $scope.clickCancel = function () {
                $hideDialog();
              }
            }]
          };

          $materialDialog(dialogViewRequestOrder);
          break;
        case REQUEST_TYPE.pay:
          if (!allowAction) return;

          rcsSession.startRequest($scope.request,
            function success () {
              toastRequest('处理请求');
            }, errorAction);
          break;
        case REQUEST_TYPE.call:
        case REQUEST_TYPE.water:
          if (!allowAction) return;

          rcsSession.closeRequest($scope.request,
            function success () {
              toastRequest('关闭请求');
            }, errorAction);
          break;
      }
    }

    function closeRequest (event, allowAction) {
      switch ($scope.request.Type) {
        case REQUEST_TYPE.pay:
          var requestScope = $scope;

          var dialogConfirmPayment = {
            templateUrl: 'template/dialog-confirmPayment',
            targetEvent: event,
            controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
              // scope fields
              $scope.request = angular.copy(requestScope.request);
              $scope.orderItems = makeOrderGroupFilter(
                rcsSession.getTableByName($scope.request.Table.TableName).OrderItems,
                rcsSession.getMenuItems());
              $scope.allowAction = allowAction;
              $scope.justClick = false;

              $scope.totalPrice = 0;
              for (var i = $scope.orderItems.length - 1; i >= 0; i--) {
                var unitPrice = $scope.request.IsPremium ? $scope.orderItems[i].premiumPrice : $scope.orderItems[i].price;
                $scope.totalPrice += unitPrice * $scope.orderItems[i].count;
              }

              // scope methods
              $scope.clickConfirmPayment = function () {
                if (!allowAction) return;
                if ($scope.justClick == true) return;

                $scope.justClick = true;

                rcsSession.closeRequest($scope.request,
                  function success () {
                    $scope.justClick = false;
                    $hideDialog();
                    toastRequest('关闭请求');
                  },
                  function error () {
                    $scope.justClick = false;
                    errorAction();
                  });
              };

              $scope.clickCancel = function () {
                $hideDialog();
              }
            }]
          };

          $materialDialog(dialogConfirmPayment);
          break;
      }
    }

    function viewRequest (event) {
      return;
    }

    function getTooltip () {
      var request = $scope.request;

      return (
        '<div class="rcs-tooltip">' +
          '餐桌: {0}<br>请求: {1}<br>({2}前提交)' +
        '</div>'
      ).format(
        request.Table.TableName,
        getRequestTypeText(request),
        getRequestCreateDurationText(request)
      );
    }

    function ifImportant () {
      return $scope.request.Importance == 1;
    }

    function getRequestText () {
      var request = $scope.request;
      return getRequestTypeText(request) + (request.IsPremium ? '(会员)' : '');
    }

    function getRequestAdditionalText () {
      var request = $scope.request;
      var text = '';
      switch (request.Type) {
        case REQUEST_TYPE.pay:
          switch (request.PayType) {
            case PAY_TYPE.cash:
              if (request.PayAmount && request.PayAmount != '') {
                if (request.Status != REQUEST_STATUS.closed) {
                  var orderItems = makeOrderGroupFilter(
                    rcsSession.getTableByName($scope.request.Table.TableName).OrderItems,
                    rcsSession.getMenuItems());
                  var totalPrice = 0;
                  var totalPricePremium = 0;
                  if (orderItems) {
                    for (var i = orderItems.length - 1; i >= 0; i--) {
                      totalPrice += orderItems[i].price * orderItems[i].count;
                      totalPricePremium += orderItems[i].premiumPrice * orderItems[i].count;
                    }
                  }

                  text = '支付{0}元 找零{1}元'.format(request.PayAmount, request.PayAmount - (request.IsPremium ? totalPricePremium : totalPrice));
                }
              }
              break;
            case PAY_TYPE.card:
              text = '准备刷卡'
              break;
            case PAY_TYPE.alipay:
              text = '使用支付宝'
              break;
          }
          break;
        case REQUEST_TYPE.order:
          text = '{0}道菜'.format(request.OrderItems.length);
          break;
      }

      return text;
    }

    function getRequestTypeText () {
      var request = $scope.request;
      switch (request.Type) {
        case REQUEST_TYPE.call:
          return REQUEST_TYPE.callText;
        case REQUEST_TYPE.pay:
          return REQUEST_TYPE.payText;
        case REQUEST_TYPE.water:
          return REQUEST_TYPE.waterText;
        case REQUEST_TYPE.order:
          return REQUEST_TYPE.orderText;
        default:
          return request.Type;
      }
    }

    function getRequestCreateDurationText () {
      var request = $scope.request;

      var diff = new Date() - new Date(request.createdAt);
      if (diff < 0) {
        diff = 0;
      }

      var durationSec = Math.floor(diff/1000);
      if (durationSec > 60) {
        return Math.floor(durationSec/60) + '分';
      }

      return durationSec + '秒';
    }

  }
}