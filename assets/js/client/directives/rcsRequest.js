angular
  .module('rcs')
  .directive('rcsRequest', ['$modal', '$materialDialog', 'rcsAPI', 'REQUEST_STATUS', 'REQUEST_TYPE',
    function ($modal, $materialDialog, rcsAPI, REQUEST_STATUS, REQUEST_TYPE) {
      return {
        restrict: 'EA',
        templateUrl: '/template/rcsRequest',

        link: function ($scope, $element, $attr) {
          var importanceBar = 1;

          $scope.requestType = REQUEST_TYPE;

          // binding click event
          var closeRequest = function () {
            if ($scope.request.Type == REQUEST_TYPE.pay) {
              // open modal to confirm payment received
              var modalInstance = $modal.open({
                templateUrl: '/template/modalConfirmPay',
                controller: 'modalRequestCtrl',
                resolve: {
                  request: function () {
                    return $scope.request;
                  }
                }
              });
            }
          }

          var processRequest = function (e) {
            switch ($scope.request.Type) {
              case REQUEST_TYPE.order:

                $materialDialog({
                  templateUrl: 'template/dialogViewRequestOrder',
                  targetEvent: e,
                  locals: {
                    request: $scope.request
                  },
                  controller: ['$scope', '$hideDialog', 'request', function($scope, $hideDialog, request) {
                    $scope.request = request;
                    $scope.close = function() {
                      $hideDialog();
                    };
                    $scope.confirmOrder = function() {
                      rcsAPI.Request.close($scope.request.id);
                      $hideDialog();
                    };
                  }]
                });
                // var modalInstance = $modal.open({
                //   templateUrl: '/template/modalViewRequestOrder',
                //   controller: 'modalViewRequestOrderCtrl',
                //   resolve: {
                //     request: function () {
                //       return $scope.request;
                //     }
                //   }
                // });
                break;
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

          $scope.clickRequest = function (e) {
            switch ($scope.request.Status) {
              case REQUEST_STATUS.new:
                processRequest(e);
                break;
              case REQUEST_STATUS.inProgress:
                closeRequest(e);
                break;
              case REQUEST_STATUS.closed:
                viewRequest(e);
                break;
            }
          }

          $element.bind('click', $scope.clickRequest);

          // properties
          var getRequestTypeText = function (request) {
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

          var getRequestCreateDurationText = function (request) {
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

          $scope.getRequestText = function () {
            var request = $scope.request;
            var text = getRequestTypeText(request);

            switch (request.Type) {
              case REQUEST_TYPE.pay:
                switch (request.PayType) {
                  case 'cash':
                    if (request.PayAmount && request.PayAmount != '') {
                      text += ' (准备支付现金:{0}元)'.format(request.PayAmount);
                    }
                    break;
                  case 'card':
                    text += ' (准备刷卡)'
                    break;
                  case 'alipay':
                    text += ' (使用支付宝)'
                    break;
                }
                break;
              case REQUEST_TYPE.order:
                text += ' ({0}道菜)'.format(request.OrderItems.length);
                break;
            }

            return text;
          }

          $scope.getTooltip = function () {
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

          // conditions
          $scope.isImportant = function() {
            return $scope.request.Importance >= importanceBar;
          }

          $scope.isInProgress = function () {
            return $scope.request.Status == REQUEST_STATUS.inProgress;
          }
        }
      }
    }]);