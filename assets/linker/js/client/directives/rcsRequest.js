angular
  .module('rcs')
  .directive('rcsRequest', ['$modal', 'rcsAPI', 'REQUEST_STATUS', 'REQUEST_TYPE',
    function ($modal, rcsAPI, REQUEST_STATUS, REQUEST_TYPE) {
      return {
        restrict: 'A',
        templateUrl: '/template/rcsRequest',

        link: function ($scope, $element, $attr) {
          var importanceBar = 2;

          var closeRequest = function () {
            if ($scope.request.Type == REQUEST_TYPE.pay) {
              // open modal to confirm payment received
              var modalInstance = $modal.open({
                templateUrl: '/template/modalConfirmPay',
                controller: 'confirmPayModalCtrl',
                resolve: {
                  request: function () {
                    return $scope.request;
                  }
                }
              });
            }
          }

          var processRequest = function () {
            switch ($scope.request.Type) {
              case REQUEST_TYPE.pay:
                rcsAPI.Request.start($scope.request.id);
                break;
              case REQUEST_TYPE.call:
              case REQUEST_TYPE.water:
                rcsAPI.Request.close($scope.request.id);
                break;
            }
          }

          var viewRequest = function () {
            var modalTemplate = '/template/modalViewRequest';
          }

          $scope.importanceNormal = function() {
            return $scope.request.Importance < importanceBar;
          }

          $scope.importanceHigh = function() {
            return $scope.request.Importance >= importanceBar;
          }

          $scope.isInProgress = function () {
            return $scope.request.Status == REQUEST_STATUS.inProgress;
          }

          $scope.clickRequest = function () {
            switch ($scope.request.Status) {
              case REQUEST_STATUS.new:
                processRequest();
                break;
              case REQUEST_STATUS.inProgress:
                closeRequest();
                break;
              case REQUEST_STATUS.closed:
                viewRequest();
                break;
            }
          }

          $scope.getRequestText = function () {
            switch ($scope.request.Type) {
              case REQUEST_TYPE.pay:
                switch ($scope.request.PayType) {
                  case 'cash':
                    var moreInfo = '';
                    if ($scope.request.PayAmount && $scope.request.PayAmount != '') {
                      moreInfo = ' (支付:{0}元)'.format($scope.request.PayAmount);
                    }
                    return '现金' + moreInfo;
                  case 'card':
                    return '刷卡';
                  case 'alipay':
                    return '支付宝';
                }
                break;
              default:
                return $scope.request.Type;
            }
          }

          $element.bind('click', $scope.clickRequest);
        }
      }
    }]);