angular
  .module('rcs')
  .controller('viewTableModalCtrl', ['$scope', '$log', '$modalInstance', 'rcsAPI', 'REQUEST_STATUS', 'tableData', 'tableTypeText', 'tableStatusText', 'editMode',
    function($scope, $log, $modalInstance, rcsAPI, REQUEST_STATUS, tableData, tableTypeText, tableStatusText, editMode){

      $scope.data = {
        table: tableData,
        tableType: tableTypeText,
        tableStatus: tableStatusText,
        newBookName: '',
        newBookCell: '',
        newBookDate: new Date(),
        newBookTime: new Date()
      };

      $scope.state = {
        isCollapsed: true,
        opened: false
      };
      $scope.editMode = editMode;
      $scope.minDate = new Date();
      $scope.hstep = 1;
      $scope.mstep = 5;
      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[1];

      $scope.getStatusUpdateTime = function () {
        return new Date($scope.data.table.StatusUpdateAt).format('mm/dd HH:MM');
      }

      $scope.isBooked = function () {
        if ($scope.data.table.BookDateTime && $scope.data.table.BookDateTime != '') {
          return true
        }

        return false;
      }

      $scope.getBookingInfo = function () {
        if (!$scope.isBooked()) {
          return '无预订';
        }

        if ((new Date() - new Date($scope.data.table.BookDateTime)) > 30*60*1000) {
         return '无预订';
        }

        return '{0} (手机:{1}) {2}'.format(
          $scope.data.table.BookName,
          $scope.data.table.BookCell,
          new Date($scope.data.table.BookDateTime).format('mm/dd HH:MM')
        );
      }

      $scope.getRequestInfo = function () {
        var requests = $scope.data.table.Requests;
        if (!requests || requests.length == 0) {
          return '无请求';
        }

        var requestCount = 0;
        for (var i = requests.length - 1; i >= 0; i--) {
          if (requests[i].Status != REQUEST_STATUS.closed) {
            requestCount++;
          }
        };

        return '[' + requestCount + ']项未完成请求';
      }

      $scope.isLinked = function () {
        if ($scope.data.table.LinkTime && $scope.data.table.LinkTime != '') {
          return true;
        }

        return false;
      }

      $scope.getLinkingInfo = function () {
        if (!$scope.isLinked()) {
          return '未关联平板';
        }

        return '已关联平板[{0}]'.format($scope.data.table.LinkedTabletId);
      }

      $scope.getLinkingTime = function () {
        if (!$scope.isLinked()) {
          return null;
        }

        return new Date($scope.data.table.LinkTime).format('mm/dd HH:MM');
      }

      // operations
      $scope.newBooking = function() {
        if ($scope.data.newBookName == '' || $scope.data.newBookCell == '') {
          return;
        }

        var bookDateTime = new Date('{0}T{1}Z'.format(
          $scope.data.newBookDate.format('yyyy-mm-dd'),
          $scope.data.newBookTime.format('HH:MM:00', true)
        ));

        // console.log('booking time:' +bookDateTime);
        rcsAPI.Table.book(
          $scope.data.table.id,
          $scope.data.newBookName,
          $scope.data.newBookCell,
          bookDateTime
        ).success(function(data) {
          $scope.data.table = data;
          $scope.state.isCollapsed = true;
          $log.debug('booked:' + $scope.getBookingInfo());
        });
      }

      $scope.cancelBooking = function() {
        rcsAPI.Table.cancelBook($scope.data.table.id).success(function(data) {
          $scope.data.table = data;
        });
      }

      $scope.removeLinking = function() {
        rcsAPI.Table.removeLink($scope.data.table.id).success(function(data) {
          $scope.data.table = data;
        });
      }

      $scope.resetTable = function() {
        rcsAPI.Table.reset($scope.data.table.id).success(function(data) {
          $scope.data.table = data;
        });
      }

      $scope.deleteTable = function() {
        rcsAPI.Table.delete($scope.data.table.id).success(function(data) {
          $modalInstance.dismiss('delete');
        });
      }

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      }

      $scope.openDatePicker = function () {
        $scope.state.opened = true;
        $scope.$apply()
      }

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      }

      $scope.getDateFormat = function (datetime) {
        return new Date(datetime).format('yyyy/mm/dd');
      }

      $scope.getTimeFormat = function (datetime) {
        return new Date(datetime).format('HH:MM');
      }
    }]);