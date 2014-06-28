angular
  .module('rcs')
  .service('rcsData', ['$rootScope', 
    function($rootScope) {

      var rcsData = {
        tables: [],
        requests: []
      };

      // connect
      var sailsSocket = io.connect();

      // on connect
      sailsSocket.on('connect', function socketConnected() {
          console.log("Socket client connected!");
          configSocket();
        });

      // listen
      var configSocket = function() {
        sailsSocket.get('/request', {}, function (requests) {
          console.log(requests);
          rcsData.requests = requests;
          $rootScope.$broadcast('requests.update');
        });

        sailsSocket.get('/table', {}, function (tables) {
          console.log(tables);
          rcsData.tables = tables;
          $rootScope.$broadcast('tables.update');
        });

        sailsSocket.on('message', function messageReceived(message) {
          console.log('New comet message received :: ', message);
          
          switch (message.model) {
            case "request":
              if (message.verb == "create") {
                var request = message.data;
                rcsData.requests.push(request);
                // todo: differentiate from update
                $rootScope.$broadcast('requests.update', message);
              } else {
                sailsSocket.get('/request', {}, function (requests) {
                  console.log(requests);
                  rcsData.requests = requests;
                  $rootScope.$broadcast('requests.update', message);
                });
              }
              break;
            case "table":
              if (message.verb == "create") {
                var table = message.data;
                rcsData.tables.push(table);
                $rootScope.$broadcast('tables.update', message);
              } else {
                sailsSocket.get('/table', {}, function (tables) {
                  console.log(tables);
                  rcsData.tables = tables;
                  $rootScope.$broadcast('tables.update', message);
                });
              }
              break;   
          }
        });
      }     

      return rcsData;
  }]);