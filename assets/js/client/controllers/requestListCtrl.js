angular
  .module('rcs')
  .controller('requestListCtrl', ['$rootScope', '$scope', '$http', '$modal', '$log', 'rcsData', 'RCS_EVENTS',
    function($rootScope, $scope, $http, $modal, $log, rcsData, RCS_EVENTS) {

      $scope.isLoadingRequest = true;

      $rootScope.$on(RCS_EVENTS.requestsUpdate, function (event) {
        $scope.requests = rcsData.getRequests();
        $scope.safeApply(function () {
          $log.debug('requestListCtrl: applied requests updated');
          $scope.isLoadingRequest = false;
        });
      })

      $scope.selectedIndex = 0;

      // conditions
      $scope.hasActiveRequest = function() {
        var requests = $scope.requests;
        for (var i = requests.length - 1; i >= 0; i--) {
          if ($scope.unclosed(requests[i])) {
            return true;
          }
        }

        return false;
      }

      $scope.closed = function(request) {
        return request.Status == "closed";
      }

      $scope.unclosed = function(request) {
        return !$scope.closed(request);
      }

      $scope.onTabSelected = function () {
        $scope.selectedIndex = this.$index;
      }

    }]);