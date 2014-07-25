angular
  .module('rcs')
  .service('rcsSocket', ['$rootScope', '$state', '$log', 'rcsAPI', 'AuthService',
    function($rootScope, $state, $log, rcsAPI, AuthService) {

      var rcsSocket = this;

      var configSocket = function(restaurantName) {
        rcsSocket.sailsSocket.on('disconnect', function socketDisconnected() {
          $log.debug("rcsSocket disconnected!");
          $state.go('login');
          rcsSocket.data = {
            tables: [],
            requests: []
          };
        });

        // get model data at the same time subscribe to model event
        // rcsSocket.sailsSocket.get('/request', {RestaurantName:restaurantName}, function (requests) {
        //   $log.debug(requests);
        //   rcsSocket.data.requests = requests;
        //   $rootScope.$broadcast('requests.update');
        // });

        // rcsSocket.sailsSocket.get('/table', {RestaurantName:restaurantName}, function (tables) {
        //   $log.debug(tables);
        //   rcsSocket.data.tables = tables;
        //   $rootScope.$broadcast('tables.update');
        // });

        rcsSocket.sailsSocket.get('/Restaurant/subscribe', {RestaurantName:restaurantName}, function (data) {
          $log.debug('rcsSocket has subscribed to Restaurant ' + restaurantName);
          $log.debug(data);

          rcsAPI.Table.list(restaurantName).success(function (tables) {
            rcsSocket.data.tables = tables;
            $log.debug('rcsSocket.data.tables:');
            $log.debug(rcsSocket.data.tables);
            $rootScope.$broadcast('tables.update');
          });

          rcsAPI.Request.list(restaurantName).success(function (requests) {
            rcsSocket.data.requests = requests;
            $log.debug('rcsSocket.data.requests:');
            $log.debug(rcsSocket.data.requests);
            $rootScope.$broadcast('requests.update');
          })
        });

        // listen to model event
        if (!rcsSocket.sailsSocket.alreadyListeningToTable) {
          rcsSocket.sailsSocket.alreadyListeningToTable = true;
          rcsSocket.sailsSocket.on('restaurant', function (msg) {
            $log.debug('rcsSocket received: ');
            $log.debug(msg);

            switch(msg.verb) {
              case 'messaged':
                var data = msg.data;
                if (data.newTable) {
                  rcsSocket.data.tables.push(data.newTable);
                  $rootScope.$broadcast('tables.update');
                }

                break;
              default:
                break;
            }
          });
          $log.debug('rcsSocket now listen to "table"');
        }

        // rcsSocket.sailsSocket.on('message', function messageReceived(message) {
        //   $log.debug('Socket message: ', message);

        //   switch (message.model) {
        //     case "request":
        //       rcsAPI.Request.list(restaurantName).success(function (data) {
        //         rcsSocket.data.requests = data;
        //         $rootScope.$broadcast('requests.update');
        //       });
        //       break;
        //     case "table":
        //       rcsAPI.Table.list(restaurantName).success(function (data) {
        //         rcsSocket.data.tables = data;
        //         $rootScope.$broadcast('tables.update');
        //       });
        //       break;
        //   }
        // });
      }

      // exposing
      rcsSocket.data = {
        tables: [],
        requests: []
      };

      rcsSocket.connect = function (restaurantName) {
        // connect
        if (rcsSocket.sailsSocket && rcsSocket.sailsSocket.socket.connected)
        {
          return configSocket(restaurantName);
        }

        if (!rcsSocket.sailsSocket) {
          rcsSocket.sailsSocket = io.connect();
        } else {
          rcsSocket.sailsSocket.socket.reconnect();
        }

        // on connect
        rcsSocket.sailsSocket.on('connect', function socketConnected() {
          $log.debug("rcsSocket connected!");
          configSocket(restaurantName);
        });
      };

      rcsSocket.disconnect = function () {
        if (rcsSocket.sailsSocket && rcsSocket.sailsSocket.socket.connected) {
          rcsSocket.sailsSocket.disconnect();
        }
      }
  }]);