angular
  .module('rcs')
  .directive('rcsRequest', [
    '$modal',
    '$materialDialog',
    'rcsAPI',
    'rcsData',
    'REQUEST_STATUS',
    'REQUEST_TYPE',
    rcsRequest]);

function rcsRequest ($modal, $materialDialog, rcsAPI, rcsData, REQUEST_STATUS, REQUEST_TYPE) {
  return {
    link: link,
    restrict: 'EA',
    templateUrl: '/template/rcsRequest'
  };

  function link ($scope, $element, $attr) {
    $scope.requestType = REQUEST_TYPE;

    var importanceBar = 1;

    // binding click event
    var closeRequest = function (e) {
      if ($scope.request.Type == REQUEST_TYPE.pay) {
        var tables = rcsData.getTables();
        var tableOrder = [];
        for (var i = tables.length - 1; i >= 0; i--) {
          if (tables[i].TableName == $scope.request.Table.TableName) {
            tableOrder = tables[i].OrderItems;
            break;
          }
        };
        var dialogConfirmPayment = {
          templateUrl: 'template/dialogConfirmPayment',
          targetEvent: e,
          locals: {
            request: $scope.request,
            tableOrder: tableOrder ? tableOrder : [],
            menu: rcsData.getMenuItems()
          },
          controller: ['$scope', '$hideDialog', 'request', 'tableOrder', 'menu', function($scope, $hideDialog, request, tableOrder, menu) {
            $scope.request = request;

            var orderItems = [];
            var totalPrice = 0;
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

              totalPrice += orderItems[itemId].price;
            }

            $scope.orderItems = [];
            $scope.totalPrice = totalPrice;
            for (var i = orderItems.length - 1; i >= 0; i--) {
              if (angular.isDefined(orderItems[i])) {
                $scope.orderItems.push(orderItems[i]);
              }
            }

            $scope.confirmPayment = function () {
              rcsAPI.Request.close($scope.request.id).success(function () {
                $hideDialog();
              })
            };
          }]
        };
        $materialDialog(dialogConfirmPayment);

        // open modal to confirm payment received
        // var modalInstance = $modal.open({
        //   templateUrl: '/template/modalConfirmPay',
        //   controller: 'modalRequestCtrl',
        //   resolve: {
        //     request: function () {
        //       return $scope.request;
        //     }
        //   }
        // });
      }
    }

    var processRequest = function (e) {
      switch ($scope.request.Type) {
        case REQUEST_TYPE.order:
          var dialogViewRequestOrder = {
            templateUrl: 'template/dialogViewRequestOrder',
            targetEvent: e,
            locals: {
              request: $scope.request,
              menu: rcsData.getMenuItems()
            },
            controller: ['$scope', '$hideDialog', 'request', 'menu', function($scope, $hideDialog, request, menu) {
              $scope.request = request;

              var orderItems = [];
              for (var i = request.OrderItems.length - 1; i >= 0; i--) {
                var itemId = request.OrderItems[i];

                if (orderItems[itemId]) {
                  orderItems[itemId].count++;
                  continue;
                }

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

              $scope.orderItems = [];
              for (var i = orderItems.length - 1; i >= 0; i--) {
                if (angular.isDefined(orderItems[i])) {
                  $scope.orderItems.push(orderItems[i]);
                }
              }

              $scope.confirmOrder = function() {
                rcsAPI.Request.close($scope.request.id).success(function () {
                  $hideDialog();
                })
              };
            }]
          };
          $materialDialog(dialogViewRequestOrder);
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