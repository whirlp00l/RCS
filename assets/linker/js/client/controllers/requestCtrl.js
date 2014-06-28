angular
  .module('rcs')
  .controller('requestCtrl', ['$scope', '$http', '$modal', 'rcsData',
    function($scope, $http, $modal, rcsData) {

      $scope.$on('requests.update', function (event) {
        console.log('requestCtrl: requests length = ' + rcsData.requests.length);
        $scope.requests = rcsData.requests;
        $scope.$apply();
      })

      var importanceBar = 2;

      $scope.importanceNormal = function(request) {
        return request.Importance < importanceBar;
      };

      $scope.importanceHigh = function(request) {
        return request.Importance >= importanceBar;
      };
      
      $scope.closed = function(request) {
        return request.Status == "closed";
      };

      $scope.unclosed = function(request) {
        return !$scope.closed(request);
      };

      $scope.openRequest = function (request) {
        $scope.currentRequest = request;
        var modalTemplate = '';
        switch ($scope.currentRequest.Status) {
          case 'new':
            request.Status = "inProgress";
            $http.post('/request/update/' + request.id, {Status:"inProgress"});
            return;
          case 'closed':
            modalTemplate = '/angular/modalViewRequest';
            break;
          case 'inProgress':
            modalTemplate = '/angular/modalConfirmPay';
            break;
        }

        var modalInstance = $modal.open({
          templateUrl: modalTemplate,
          controller: 'requestModalCtrl',
          resolve: {
            request: function () {
              return $scope.currentRequest;
            }
          }
        });

        modalInstance.result.then(function () {
          switch ($scope.currentRequest.Status) {
            case 'new':
              $http.post('/request/update/' + request.id, {Status:"inProgress"});
              break;
            case 'closed':
              $http.get('/request/destroy/' + request.id);
              break;
            case 'inProgress':
              request.Status = "closed";
              $http.post('/request/close/' + request.id, {ClosedAt:(new Date()).format("mm/dd HH:MM")});
              break;
          }
        });
      };

      $scope.getPayTypeText = function (request) {
        switch (request.PayType) {
          case 'cash':
            var moreInfo = '';
            if (request.PayAmount && request.PayAmount != '') {
              var change = parseFloat(request.PayAmount) - 72;
              if (change >= 0) {
                moreInfo = ' (找零:{0}元)'.format(change);
              }
            }
            return '现金' + moreInfo;
          case 'card':
            return '刷卡';
          case 'alipay':
            return '支付宝';
        }
      };
    }]);