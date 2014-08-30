angular
  .module('rcs')
  .directive('breadcrumb', ['$state', '$stateParams', '$interpolate', breadcrumb])
  .directive('rcsTable', ['$rootScope', '$materialToast', 'TABLE_STATUS', rcsTable]);

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

function rcsTable ($rootScope, $materialToast, TABLE_STATUS) {
  return {
    link: link,
    $scope: {
      table: '=',
      editingTable: '='
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

    var getTableStatusText = getTableStatusText;
    var getTableUpdateDurationMin = getTableUpdateDurationMin;

    function clickManageTable () {
      if ($scope.ifNull()) return;
      simpleToast('manageTable:' + $scope.table.TableName);
    }

    function clickEditTable() {
      simpleToast('editTable:' + ($scope.ifNull() ? 'null' : $scope.table.TableName));
    }

    function simpleToast (content) {
      $materialToast({
        template: '<material-toast class="rcs">' + content + '</material-toast>',
        duration: 1000,
        position: 'buttom right'
      });
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