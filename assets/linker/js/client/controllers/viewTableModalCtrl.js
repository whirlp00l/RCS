angular
  .module('rcs')
  .controller('viewTableModalCtrl', ['$scope', '$http', '$modalInstance', 'tableData', 'tableTypeText', 'tableStatusText',
    function($scope, $http, $modalInstance, tableData, tableTypeText, tableStatusText){
      
      $scope.data = {
        table: tableData,
        tableType: tableTypeText,
        tableStatus: tableStatusText,
        tableStatusUpdateAt:　(new Date(tableData.StatusUpdateAt)).format("mm/dd HH:MM"),
        newBookName: '',
        newBookCell: '',
        newBookDate: new Date(),
        newBookTime: new Date()
      };
      
      $scope.state = {
        isCollapsed: true
      };

      $scope.minDate = new Date();
      $scope.hstep = 1;
      $scope.mstep = 15;

      $scope.getBookingInfo = function () {
        if (!$scope.data.table.BookDateTime || $scope.data.table.BookDateTime == '') {
          return "无预订";
        }

        if ((new Date() - new Date($scope.data.table.BookDateTime)) > 30*60*1000) {
         return "无预订";
        }

        return '{0} (手机:{1}), {2}'.format(
          $scope.data.table.BookName,
          $scope.data.table.BookCell,
          new Date($scope.data.table.BookDateTime).format('yyyy/mm/dd HH:MM')
        );
      }

      $scope.getLinkingInfo = function () {
        if (!$scope.data.table.LinkTime || $scope.data.table.LinkTime == '') {
          return "未关联平板";
        }

        return '已关联平板 [{0}] (关联于:{1})'.format(
          $scope.data.table.LinkedTabletId,
          new Date($scope.data.table.LinkTime).format('yyyy/mm/dd HH:MM')
        );
      }

      $scope.newBooking = function() {
        if ($scope.data.newBookName == '' || $scope.data.newBookCell == '') {
          return;
        }

        var bookDateTime = new Date('{0}T{1}Z'.format(
          $scope.data.newBookDate.format('yyyy-mm-dd'),
          $scope.data.newBookTime.format('HH:MM:00', true)
        ));

        // console.log('booking time:' +bookDateTime);

        $http.post('/table/book/' + $scope.data.table.id, {
            BookName: $scope.data.newBookName,
            BookCell: $scope.data.newBookCell,
            BookDateTime: bookDateTime
          }).success(function(data) {
            $scope.data.table = data;
            $scope.state.isCollapsed = true;
            console.log('booked:' + $scope.getBookingInfo());
          });
      }

      $scope.cancelBooking = function() {
        $http.get('/table/cancelBook/' + $scope.data.table.id).success(function(data) {
            $scope.data.table = data;
        });
      }

      $scope.removeLinking = function() {
        $http.get('/table/removeLink/' + $scope.data.table.id).success(function(data) {
            $scope.data.table = data;
        }); 
      }

      $scope.resetTable = function() {
        $http.get('/table/reset/' + $scope.data.table.id).success(function(data) {
            $modalInstance.dismiss('cancel');
        });
      }

      $scope.deleteTable = function() {
        $http.get('/table/delete/' + $scope.data.table.id).success(function(data) {
            $modalInstance.dismiss('cancel');
        });
      }

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }]);