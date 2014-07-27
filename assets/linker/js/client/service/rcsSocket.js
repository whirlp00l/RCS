angular
  .module('rcs')
  .service('rcsSocket', ['$rootScope', '$state', '$log', 'rcsAPI', 'AuthService',
    function($rootScope, $state, $log, rcsAPI, AuthService) {

      var rcsSocket = this;

      var disconnectAndLogout = function () {
        $log.debug("rcsSocket: disconnected!");

        rcsSocket.data = {
          tables: [],
          requests: []
        };

        AuthService.logout(function () {
          $state.go('login');
        })
      }

      var subscribe = function () {
        // clear cache data
        rcsSocket.data = {
          tables: [],
          requests: []
        };

        // subscribe to restaurant message event
        rcsSocket.sailsSocket.get('/Restaurant/subscribe', {
          RestaurantName:rcsSocket.restaurantName
        }, function getSubscribe (data) {
          $log.debug(data);
        });
      }

      var listen = function() {
        if (!rcsSocket.sailsSocket.alreadyListening) {
          rcsSocket.sailsSocket.alreadyListening = true;

          // listen to 'disconnect'
          rcsSocket.sailsSocket.on('disconnect', function () {
            disconnectAndLogout();
          });

          // listen to 'init'
          rcsSocket.sailsSocket.on('init', function (msg) {
            rcsSocket.data.tables = msg.table;
            $rootScope.$broadcast('tables.update');
            rcsSocket.data.requests = msg.request;
            $rootScope.$broadcast('requests.update');
          });

          // listen to 'message'

          rcsSocket.sailsSocket.on('restaurant', function (msg) {
            $log.debug('rcsSocket: received message');
            $log.debug(msg);

            switch(msg.verb) {
              case 'messaged':
                var data = msg.data;

                // handle new-table
                if (data.newTable) {
                  if (!angular.isArray(data.newTable)) {
                    data.newTable = [data.newTable];
                  }

                  rcsSocket.data.tables = rcsSocket.data.tables.concat(data.newTable);
                  $rootScope.$broadcast('tables.update');
                }

                // handle new-request
                if (data.newRequest) {
                  if (!angular.isArray(data.newRequest)) {
                    data.newRequest = [data.newRequest];
                  }

                  rcsSocket.data.requests = rcsSocket.data.requests.concat(data.newRequest);
                  $rootScope.$broadcast('requests.update');
                }

                // handle remove-table
                if (data.removeTableId) {
                  if (!angular.isArray(data.removeTableId)) {
                    data.removeTableId = [data.removeTableId];
                  }

                  var removedCount = 0;
                  for (var i = rcsSocket.data.tables.length - 1; i >= 0; i--) {
                    if (data.removeTableId.indexOf(rcsSocket.data.tables[i].id) != -1) {
                      rcsSocket.data.tables.splice(i, 1);
                      if (++removedCount == data.removeTableId.length) {
                        break;
                      }
                    }
                  };

                  $rootScope.$broadcast('tables.update');
                }

                // handle remove-request
                if (data.removeRequestId) {
                  if (!angular.isArray(data.removeRequestId)) {
                    data.removeRequestId = [data.removeRequestId];
                  }

                  var removedCount = 0;
                  for (var i = rcsSocket.data.requests.length - 1; i >= 0; i--) {
                    if (data.removeRequestId.indexOf(rcsSocket.data.requests[i].id) != -1) {
                      rcsSocket.data.requests.splice(i, 1);
                      if (++removedCount == data.removeRequestId.length) {
                        break;
                      }
                    }
                  };

                  $rootScope.$broadcast('requests.update');
                }

                // handle set-table
                if (data.setTable) {
                  if (!angular.isArray(data.setTable)) {
                    data.setTable = [data.setTable];
                  }

                  for (var i = data.setTable.length - 1; i >= 0; i--) {
                    var tableToUpdate = data.setTable[i];

                    for (var k = rcsSocket.data.tables.length - 1; k >= 0; k--) {
                      if (rcsSocket.data.tables[k].id == tableToUpdate.id) {
                        rcsSocket.data.tables[k] = tableToUpdate;
                        break;
                      }
                    }
                  }

                  $rootScope.$broadcast('tables.update');
                }

                // handle set-request
                if (data.setRequest) {
                  if (!angular.isArray(data.setRequest)) {
                    data.setRequest = [data.setRequest];
                  }

                  for (var i = data.setRequest.length - 1; i >= 0; i--) {
                    var requestToUpdate = data.setRequest[i];

                    for (var k = rcsSocket.data.requests.length - 1; k >= 0; k--) {
                      if (rcsSocket.data.requests[k].id == requestToUpdate.id) {
                        rcsSocket.data.requests[k] = requestToUpdate;
                        break;
                      }
                    }
                  }

                  $rootScope.$broadcast('tables.update');
                }

                break;
              default:
                $log.debug('rcsSocket: unsopported verb [' + msg.verb + '].');
                break;
            }
          });

          $log.debug('rcsSocket: now listening...');
        }
      }

      // exposing
      rcsSocket.restaurantName = null;

      rcsSocket.data = {
        tables: [],
        requests: []
      };

      rcsSocket.connect = function (restaurantName) {

        rcsSocket.restaurantName = restaurantName;

        // check if already connected
        if (rcsSocket.sailsSocket && rcsSocket.sailsSocket.socket.connected)
        {
          $log.debug("rcsSocket had already connected!");
          return subscribe();
        }

        // reconnect
        if (rcsSocket.sailsSocket) {
          $log.debug("rcsSocket: reconnecting...");
          return rcsSocket.sailsSocket.socket.reconnect();
        }

        // connect
        $log.debug("rcsSocket: connecting...");
        rcsSocket.sailsSocket = io.connect();

        // listen to 'connect'
        rcsSocket.sailsSocket.on('connect', function rcsSocketConnected() {
          $log.debug("rcsSocket just connected!");

          // subscribe to restaurant message event
          subscribe();
          return listen();
        });
      };

      rcsSocket.disconnect = function () {
        // disconnect
        if (rcsSocket.sailsSocket && rcsSocket.sailsSocket.socket.connected) {
          rcsSocket.sailsSocket.disconnect();
        } else {
          disconnectAndLogout();
        }
      }
  }]);