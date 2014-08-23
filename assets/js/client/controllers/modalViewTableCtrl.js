angular
  .module('rcs')
  .controller('modalViewTableCtrl', ['$scope', '$log', '$modalInstance', 'rcsAPI', 'rcsData', 'REQUEST_STATUS', 'param',
    function($scope, $log, $modalInstance, rcsAPI, rcsData, REQUEST_STATUS, param){

      // param
      $scope.tableData = param.tableData;
      $scope.editMode = param.editMode;

      $scope.getTableStatusText = function () {
        return param.getTableStatusText($scope.tableData)
      }

      $scope.isBooked = function () {
        return param.isBooked($scope.tableData);
      }

      // values
      $scope.booking = {
        newBookName: '',
        newBookCell: '',
        newBookDate: new Date(),
        newBookTime: new Date()
      };

      $scope.state = {
        isCollapsed: true,
        isOrderCollapsed : true,
        opened: false
      };

      $scope.minDate = new Date();
      $scope.hstep = 1;
      $scope.mstep = 5;
      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[1];

      var menu = rcsData.getMenuItems();
      var orderItems = [];
      var tableOrder = $scope.tableData.OrderItems ? $scope.tableData.OrderItems : [];
      for (var i = tableOrder.length - 1; i >= 0; i--) {
        var itemId = tableOrder[i];

        if (orderItems[itemId]) {
          orderItems[itemId].count++;
        } else {
          for (var j = menu.length - 1; j >= 0; j--) {
            if (menu[j].id == itemId) {
              var itemName = menu[j].Name;
              var itemType = menu[j].Type;
              var itemPrice = menu[j].Price;
              break;
            }
          }

          orderItems[itemId] = {
            name: itemName,
            type: itemType,
            price: itemPrice,
            count: 1
          };
        }
      }

      $scope.orderItems = [];
      for (var i = orderItems.length - 1; i >= 0; i--) {
        if (angular.isDefined(orderItems[i])) {
          $scope.orderItems.push(orderItems[i]);
        }
      }

      // method (getting info)
      $scope.getStatusUpdateTime = function () {
        return new Date($scope.tableData.StatusUpdateAt).format('mm/dd HH:MM');
      }

      $scope.getBookingInfo = function () {
        if (!$scope.isBooked()) {
          return '无预订';
        }

        return '{0} (联系方式:{1}) {2}'.format(
          $scope.tableData.BookName,
          $scope.tableData.BookCell,
          new Date($scope.tableData.BookDateTime).format('mm/dd HH:MM')
        );
      }

      $scope.getRequestInfo = function () {
        var table = $scope.tableData;
        if (table.ActiveRequestCount == 0) {
          return '无请求';
        }

        return '[' + table.ActiveRequestCount + ']项未完成请求';
      }

      $scope.getOrderInfo = function () {
        var orderItemsCount = $scope.tableData.OrderItems ? $scope.tableData.OrderItems.length : 0;
        if (orderItemsCount == 0) {
          return '未点菜';
        }

        return '[' + orderItemsCount + ']道已点菜品';
      }

      $scope.isLinked = function () {
        if ($scope.tableData.LinkTime && $scope.tableData.LinkTime != '') {
          return true;
        }

        return false;
      }

      $scope.getLinkingInfo = function () {
        if (!$scope.isLinked()) {
          return '未关联平板';
        }

        return '已关联平板[{0}]'.format($scope.tableData.LinkedTabletId);
      }

      $scope.getLinkingTime = function () {
        if (!$scope.isLinked()) {
          return null;
        }

        return new Date($scope.tableData.LinkTime).format('mm/dd HH:MM');
      }

      // $scope.getDateFormat = function (datetime) {
      //   return new Date(datetime).format('yyyy/mm/dd');
      // }

      // $scope.getTimeFormat = function (datetime) {
      //   return new Date(datetime).format('HH:MM');
      // }

      // method (operations)
      $scope.newBooking = function() {
        if ($scope.booking.newBookName == '' || $scope.booking.newBookCell == '') {
          return;
        }

        var bookDateTime = new Date('{0}T{1}Z'.format(
          $scope.booking.newBookDate.format('yyyy-mm-dd'),
          $scope.booking.newBookTime.format('HH:MM:00', true)
        ));

        rcsAPI.Table.book(
          $scope.tableData.id,
          $scope.booking.newBookName,
          $scope.booking.newBookCell,
          bookDateTime
        ).success(function(data) {
          $scope.tableData = data;
          $scope.state.isCollapsed = true;
          $log.debug('booked:' + $scope.getBookingInfo());
        });
      }

      $scope.cancelBooking = function() {
        rcsAPI.Table.cancelBook($scope.tableData.id).success(function(data) {
          $scope.tableData = data;
        });
      }

      $scope.removeLinking = function() {
        rcsAPI.Table.removeLink($scope.tableData.id).success(function(data) {
          $scope.tableData = data;
        });
      }

      $scope.resetTable = function() {
        rcsAPI.Table.reset($scope.tableData.id).success(function(data) {
          $scope.tableData = data;
        });
      }

      $scope.deleteTable = function() {
        rcsAPI.Table.delete($scope.tableData.id).success(function(data) {
          $modalInstance.dismiss('delete');
        });
      }

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      }
    }]);