angular
  .module('rcs')
  .controller('tableCtrl', ['$scope', '$log', 'sailsSocket', function($scope, $log, sailsSocket){

    if (sailsSocket.socket.connected) {
      sailsSocket.get('/table', {}, function (tables) {
        console.log(tables);
        $scope.tables = tables;
        $scope.$apply();
      });

      sailsSocket.on('message', function messageReceived(message) {
        console.log('New comet message received :: ', message);
        
        if (message.model == "table") {
          if (message.verb == "create") {
            var table = message.data;
            console.log("Add table [" + table.TableName + "] for restaurant [" + table.RestaurantName + "]");
            $scope.tables.push(table);
            $scope.$apply();
          } else {
            sailsSocket.get('/table', {}, function (tables) {
              console.log(tables);
              $scope.tables = tables;
              $scope.$apply();
            });
          }
        }
      });
    } else {
      sailsSocket.on('connect', function socketConnected() {
        console.log("client connected!");

        sailsSocket.get('/table', {}, function (tables) {
          console.log(tables);        
          $scope.tables = tables;
          $scope.$apply();
        });

        sailsSocket.on('message', function messageReceived(message) {
          console.log('New comet message received :: ', message);
          
          if (message.model == "table") {
            if (message.verb == "create") {
              var table = message.data;
              console.log("Add table [" + table.TableName + "] for restaurant [" + table.RestaurantName + "]");
              $scope.tables.push(table);
              $scope.$apply();
            } else {
              sailsSocket.get('/table', {}, function (tables) {
                console.log(tables);
                $scope.tables = tables;
                $scope.$apply();
              });
            }
          }
        });
           
      });
    }


    // $sails.on('connect', function (message) {
    //   $log.debug("client connected");
    // });

    // $sails.get('/table', {}, function (tables) {
    //   console.log(tables);
    // });
    // (function () {
    //   $sails.get("/table")
    //     .success(function (tables) {
    //       $scope.tables = tables;
    //     })
    //     .error(function (data) {
    //       alert('We got a problem!');
    //     });

    //   $sails.on("connect", function (message) {
    //     $log.debug("client connected");
    //   })

    //   $sails.on("message", function (message) {
    //     if (message.verb === "create") {
    //       $log.debug("client message: " + message.data);
    //       $scope.bars.push(message.data);
    //     }
    //   });
    // }());

    // $scope.socketReady = false; // Wait for socket to connect

    // $scope.$on('sailsSocket:disconnect', function(ev, data) {
    //   $log.debug("client disconnected");
    //   $scope.socketReady = false;
    // });

    // $scope.$on('sailsSocket:failure', function(ev, data) {
    //   $log.debug("failure");
    // });

    // $scope.$on('sailsSocket:connect', function(ev, data) {
    //   // Get full collection of todos
    //   sailsSocket.get('/table', {}, function(response) {
    //       $scope.tables = response;
    //       $log.debug('sailsSocket::/table', response);
    //     });
    // });

    // $scope.$on('sailsSocket:message', function(ev, data) {
    //   // Example messages:
    //   //   {model: "todo", verb: "create", data: Object, id: 25}
    //   //   {model: "todo", verb: "update", data: Object, id: 3}
    //   //   {model: "todo", verb: "destroy", id: 20}
    //   $log.debug('New comet message received :: ', data);

    //   if (data.model === 'table') {
    //     switch(data.verb) {
    //       case 'create':
    //         break;

    //       case 'destroy':
    //         break;

    //       case 'update':
    //         break;
    //     }
    //   }
    // });
  }])
  // .controller('tableCtrl', function tableCtrl($scope, sailsSocket){
  //   // $scope.tables = tablesInRestaurant;
  // })