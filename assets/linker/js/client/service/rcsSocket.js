angular
  .module('rcs')
  .service('rcsSocket', ['$rootScope', '$state', 'AuthService',
    function($rootScope, $state, AuthService) {

      var rcsSocket = this;
      var configSocket = function() {
        rcsSocket.sailsSocket.on('disconnect', function socketDisconnected() {
          console.log("Socket client disconnected!");
          $state.go('login');
          // rcsSocket.data = {
          //   tables: [],
          //   requests: []
          // };
          // $rootScope.$broadcast('requests.update');
          // $rootScope.$broadcast('tables.update');
        });

        // subscribe
        rcsSocket.sailsSocket.get('/request', {}, function (requests) {
          console.log(requests);
          rcsSocket.data.requests = requests;
          $rootScope.$broadcast('requests.update');
        });

        rcsSocket.sailsSocket.get('/table', {}, function (tables) {
          console.log(tables);
          rcsSocket.data.tables = tables;
          $rootScope.$broadcast('tables.update');
        });

        // message
        rcsSocket.sailsSocket.on('message', function messageReceived(message) {
          console.log('New comet message received :: ', message);
          
          switch (message.model) {
            case "request":
              if (message.verb == "create") {
                var request = message.data;
                rcsSocket.data.requests.push(request);
                // todo: differentiate from update
                $rootScope.$broadcast('requests.update', message);
              } else {
                rcsSocket.sailsSocket.get('/request', {}, function (requests) {
                  console.log(requests);
                  rcsSocket.data.requests = requests;
                  $rootScope.$broadcast('requests.update', message);
                });
              }
              break;
            case "table":
              if (message.verb == "create") {
                var table = message.data;
                rcsSocket.data.tables.push(table);
                $rootScope.$broadcast('tables.update', message);
              } else {
                rcsSocket.sailsSocket.get('/table', {}, function (tables) {
                  console.log(tables);
                  rcsSocket.data.tables = tables;
                  $rootScope.$broadcast('tables.update', message);
                });
              }
              break;   
          }
        });
      }

      // exposing
      rcsSocket.data = {
        tables: [],
        requests: []
      };

      rcsSocket.connect = function () {
        // connect
        if (rcsSocket.sailsSocket && rcsSocket.sailsSocket.socket.connected)
        {
          configSocket();
        } else {
          if (!rcsSocket.sailsSocket) {
            rcsSocket.sailsSocket = io.connect();
          } else {
            rcsSocket.sailsSocket.socket.reconnect();
          }

          // on connect
          rcsSocket.sailsSocket.on('connect', function socketConnected() {
            console.log("Socket client connected!");
            configSocket();
          });
        }       
      };

      rcsSocket.disconnect = function () {
        if (rcsSocket.sailsSocket && rcsSocket.sailsSocket.socket.connected) {
          rcsSocket.sailsSocket.disconnect();
        }
      }
  }]);