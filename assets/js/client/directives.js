angular
  .module('rcs')
  .directive('breadcrumb', ['$state', '$stateParams', '$interpolate', breadcrumb])
  .directive('rcsTable', ['$rootScope', 'TABLE_STATUS', rcsTable])
  .directive('rcsRequest', ['$rootScope', 'REQUEST_STATUS', 'REQUEST_TYPE', rcsRequest]);

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

function rcsTable ($rootScope, TABLE_STATUS) {
  return {
    link: link,
    $scope: {
      table: '=',
      editingTable: '=',
      simpleToast: '&',
      safeApply: '&'
    },
    restrict: 'E',
    templateUrl: '/template/directive-rcsTable',
    replace: false
  };

  function link ($scope, $element, $attrs) {
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

    var getTableStatusText = getTableStatusText;
    var getTableUpdateDurationMin = getTableUpdateDurationMin;

    function clickManageTable () {
      if ($scope.ifNull()) return;
      $scope.safeApply();
      $scope.simpleToast('manageTable:' + $scope.table.TableName);
    }

    function clickEditTable() {
      var mapRow = $scope.$parent.$index;
      var mapCol = $scope.$index;

      $scope.table = {
        TableName: 'A' + mapRow + mapCol,
        TableType: 'A',
        Status: 'empty',
        ActiveRequestCount: 0,
        MapRow: mapRow,
        MapCol: mapCol
      };

      $scope.safeApply();
      $scope.simpleToast('editTable:' + mapRow + ',' + mapCol);
      // $scope.simpleToast
    }

    function ifNull () {
      return $scope.table === 'null';
    }

    function ifEmpty () {
      return $scope.table !== 'null' && $scope.table.Status == TABLE_STATUS.empty;
    }

    function ifServing () {
      !$scope.ifEmpty() && !$scope.ifPaid()
      return $scope.table !== 'null' && !$scope.ifEmpty() && !$scope.ifPaid();
    }

    function ifPaid () {
      return $scope.table !== 'null' && $scope.table.Status == TABLE_STATUS.paid;
    }

    function ifLinked () {
      if ($scope.ifNull()) {
        return false;
      }

      var table = $scope.table;
      return (table.LinkTime);
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
          '<div class="rcs-tooltip">' +
            '预订: {0} {1}' +
          '</div>'
          ).format(
            table.BookName,
            new Date(table.BookDateTime).format('mm/dd HH:MM')
          );
      }

      var linkInfo =
        '<div class="rcs-tooltip"><i class="{0}"></i>{1}</div>'.format(
          $scope.ifLinked() ? 'fa fa-link' :'fa fa-unlink',
          $scope.ifLinked() ? '&nbsp;已关联' :'&nbsp;未关联');

      // return 'Hello';
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

function rcsRequest ($rootScope, REQUEST_STATUS, REQUEST_TYPE) {
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
    $scope.requestStatus = REQUEST_STATUS;
    $scope.requestType = REQUEST_TYPE;

    $scope.clickRequest = clickRequest;
    $scope.getTooltip = getTooltip;
    $scope.getRequestText = getRequestText;
    $scope.getRequestAdditionalText = getRequestAdditionalText;

    var getRequestTypeText = getRequestTypeText;
    var getRequestCreateDurationText = getRequestCreateDurationText;

    function clickRequest () {
      if ($scope.request.Status == REQUEST_STATUS.new) {
        $scope.request.Status = REQUEST_STATUS.inProgress;
      } else if ($scope.request.Status == REQUEST_STATUS.inProgress) {
        $scope.request.Status = REQUEST_STATUS.closed;
      }
      return $scope.simpleToast(getRequestText() + ' ' + getRequestAdditionalText());
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

    function getRequestText () {
      var request = $scope.request;
      return getRequestTypeText(request);
    }

    function getRequestAdditionalText () {
      var request = $scope.request;
      var text = '';
      switch (request.Type) {
        case REQUEST_TYPE.pay:
          switch (request.PayType) {
            case 'cash':
              if (request.PayAmount && request.PayAmount != '') {
                text = '准备支付现金:{0}元'.format(request.PayAmount);
              }
              break;
            case 'card':
              text = '准备刷卡'
              break;
            case 'alipay':
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