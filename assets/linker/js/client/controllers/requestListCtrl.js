angular
  .module('rcs')
  .controller('requestListCtrl', ['$scope', '$http', '$modal', '$log', 'rcsSocket', 'RCS_EVENTS',
    function($scope, $http, $modal, $log, rcsSocket, RCS_EVENTS) {

      $scope.$on(RCS_EVENTS.requestsUpdate, function (event) {
        $scope.requests = rcsSocket.data.requests;
        $scope.safeApply(function () {
          $log.debug('requestCtrl: applied requests updated');
        });
      })

      $scope.closed = function(request) {
        return request.Status == "closed";
      }


      $scope.unclosed = function(request) {
        return !$scope.closed(request);
      }

    }]);