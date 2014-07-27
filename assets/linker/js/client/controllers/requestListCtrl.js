angular
  .module('rcs')
  .controller('requestListCtrl', ['$scope', '$http', '$modal', '$log', 'rcsSocket',
    function($scope, $http, $modal, $log, rcsSocket) {

      $scope.$on('requests.update', function (event) {
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