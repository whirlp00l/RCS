angular
  .module('rcs')
  .controller('requestListCtrl', ['$rootScope', '$scope', '$http', '$modal', '$log', 'rcsData', 'RCS_EVENTS',
    function($rootScope, $scope, $http, $modal, $log, rcsData, RCS_EVENTS) {

      $rootScope.$on(RCS_EVENTS.requestsUpdate, function (event) {
        $scope.requests = rcsData.getRequests();
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