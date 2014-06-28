angular
  .module('rcs')
  .controller('homeCtrl', ['$scope', '$window', 
    function($scope, $window){
      // var configSocket = function() {
      //   sailsSocket.get('/request', {}, function (requests) {
      //     console.log(requests);
      //     $scope.requests = requests;
      //     $scope.$apply();
      //   });

      //   sailsSocket.on('message', function messageReceived(message) {
      //     console.log('New comet message received :: ', message);
          
      //     if (message.model == "request") {
      //       if (message.verb == "create") {
      //         var request = message.data;
      //         $scope.requests.push(request);
      //         $scope.$apply();
      //       } else {
      //         sailsSocket.get('/request', {}, function (requests) {
      //           console.log(requests);
      //           $scope.requests = requests;
      //           $scope.$apply();
      //         });
      //       }
      //     }
      //   });
      // }

      // if (sailsSocket.socket.connected) {
      //   configSocket();
      // } else {
      //   sailsSocket.on('connect', function socketConnected() {
      //     console.log("client connected!");
      //     configSocket();
      //   });
      // }

      $scope.resize = function () {
        console.log($window.innerHeight);
        console.log($('#size'));
      }
    }]);