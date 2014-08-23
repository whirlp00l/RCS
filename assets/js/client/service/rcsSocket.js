angular
  .module('rcs')
  .service('rcsSocket', ['$rootScope', '$state', '$log', 'rcsAPI', 'rcsData', 'rcsAuth', 'RCS_EVENTS',
    function($rootScope, $state, $log, rcsAPI, rcsData, rcsAuth, RCS_EVENTS) {

      var rcsSocket = this;

      var disconnectAndLogout = function () {
        if (rcsSocket.sailsSocket) {
          rcsSocket.sailsSocket.removeAllListeners();
          rcsSocket.sailsSocket = null;
        }

        $log.debug("rcsSocket: disconnected!");

        rcsAuth.logout(function () {
          $state.go('login');
        })
      }

      var subscribe = function () {
        // subscribe to restaurant message event
        var restaurantId = rcsData.getRestaurantId();
        if (!restaurantId) {
          return $log.error('rcsSocket: failed to subscribe, invalid restaurantId = ' + restaurantId);
        }

        rcsSocket.sailsSocket.get('/Restaurant/subscribe', {RestaurantId: rcsData.getRestaurantId()});
      }

      var notify = function (tableChanged, requestChanged) {
        var startTime = new Date();
        if (tableChanged) {
          $log.debug('rcsSocket: started broadcasting tablesUpdate (' + (new Date() - startTime) + 'ms)');
          $rootScope.$emit(RCS_EVENTS.tablesUpdate, {startTime: startTime});
          $log.debug('rcsSocket: broadcasted tablesUpdate (' + (new Date() - startTime) + 'ms)');
        }

        if (requestChanged) {
          $log.debug('rcsSocket: started broadcasting requestsUpdate (' + (new Date() - startTime) + 'ms)');
          $rootScope.$emit(RCS_EVENTS.requestsUpdate, {startTime: startTime});
          $log.debug('rcsSocket: broadcasted requestsUpdatet (' + (new Date() - startTime) + 'ms)');
        }
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
            $log.debug('rcsSocket: received init');
            $log.debug(msg);

            rcsData.setTables(msg.table);
            rcsData.setRequests(msg.request);
            notify(true, true);
          });

          // listen to 'message'

          // notify other subscribers for new comer
          // Restaurant.message(restaurant, {
          //   newSubscriber: currentUser.Email
          // }, req);

          rcsSocket.sailsSocket.on('restaurant', function (msg) {
            $log.debug('rcsSocket: received message');
            $log.debug(msg);

            switch(msg.verb) {
              case 'messaged':
                var data = msg.data;
                var tables = rcsData.getTables();
                var requests = rcsData.getRequests();
                var tableChanged = false;
                var requestChanged = false;

                // handle new-table
                if (data.newTable) {
                  if (!angular.isArray(data.newTable)) {
                    data.newTable = [data.newTable];
                  }

                  tables = tables.concat(data.newTable);
                  tableChanged = true;
                }

                // handle new-request
                if (data.newRequest) {
                  if (!angular.isArray(data.newRequest)) {
                    data.newRequest = [data.newRequest];
                  }

                  requests = requests.concat(data.newRequest);
                  requestChanged = true;
                }

                // handle remove-table
                if (data.removeTableId) {
                  if (!angular.isArray(data.removeTableId)) {
                    data.removeTableId = [data.removeTableId];
                  }

                  var removedCount = 0;
                  for (var i = tables.length - 1; i >= 0; i--) {
                    if (data.removeTableId.indexOf(tables[i].id) != -1) {
                      tables.splice(i, 1);
                      if (++removedCount == data.removeTableId.length) {
                        break;
                      }
                    }
                  }

                  tableChanged = true;
                }

                // handle remove-request
                if (data.removeRequestId) {
                  if (!angular.isArray(data.removeRequestId)) {
                    data.removeRequestId = [data.removeRequestId];
                  }

                  var removedCount = 0;
                  for (var i = requests.length - 1; i >= 0; i--) {
                    if (data.removeRequestId.indexOf(requests[i].id) != -1) {
                      requests.splice(i, 1);
                      if (++removedCount == data.removeRequestId.length) {
                        break;
                      }
                    }
                  }

                  requestChanged = true;
                }

                // handle set-table
                if (data.setTable) {
                  if (!angular.isArray(data.setTable)) {
                    data.setTable = [data.setTable];
                  }

                  for (var i = data.setTable.length - 1; i >= 0; i--) {
                    var tableToUpdate = data.setTable[i];

                    for (var k = tables.length - 1; k >= 0; k--) {
                      if (tables[k].id == tableToUpdate.id) {
                        tables[k] = tableToUpdate;
                        break;
                      }
                    }
                  }

                  tableChanged = true;
                }

                // handle set-request
                if (data.setRequest) {
                  if (!angular.isArray(data.setRequest)) {
                    data.setRequest = [data.setRequest];
                  }

                  for (var i = data.setRequest.length - 1; i >= 0; i--) {
                    var requestToUpdate = data.setRequest[i];

                    for (var k = requests.length - 1; k >= 0; k--) {
                      if (requests[k].id == requestToUpdate.id) {
                        requests[k] = requestToUpdate;
                        break;
                      }
                    }
                  }

                  requestChanged = true;
                }

                // set the data back
                rcsData.setTables(tables);
                rcsData.setRequests(requests);
                notify(tableChanged, requestChanged);

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

      rcsSocket.connect = function () {

        // check if already connected
        if (rcsSocket.sailsSocket && rcsSocket.sailsSocket.socket.connected)
        {
          $log.debug("rcsSocket: had already connected!");
          return subscribe();
        }

        // reconnect
        if (rcsSocket.sailsSocket) {
          $log.debug("rcsSocket: reconnecting...");
          return rcsSocket.sailsSocket.socket.reconnect();
        }

        // connect (force new connection, passing null as the 1st to let socket use the default url)
        $log.debug("rcsSocket: connecting...");
        rcsSocket.sailsSocket = io.connect(null, { 'force new connection': true });

        // listen to 'connect'
        rcsSocket.sailsSocket.on('connect', function rcsSocketConnected() {
          $log.debug("rcsSocket: just connected!");

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