angular
  .module('rcs')
  .controller('requestCtrl', ['$scope', '$http', '$modal', '$log', 'rcsSocket',
    function($scope, $http, $modal, $log, rcsSocket) {

      $scope.$on('requests.update', function (event) {
        $scope.requests = rcsSocket.data.requests;
        $scope.safeApply(function () {
          $log.debug('requestCtrl: applied requests updated');
        });
      })

      $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
          if(fn && (typeof(fn) === 'function')) {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      };

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
            modalTemplate = '/template/modalViewRequest';
            break;
          case 'inProgress':
            modalTemplate = '/template/modalConfirmPay';
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