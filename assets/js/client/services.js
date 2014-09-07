angular
  .module('rcs')
  .factory('rcsHttp', ['$rootScope', '$http', '$state', '$log', 'RCS_EVENT', rcsHttp])
  .factory('rcsSession', ['$rootScope', '$log', 'rcsHttp', 'RCS_EVENT', 'REQUEST_STATUS', rcsSession]);

function rcsSession ($rootScope, $log, rcsHttp, RCS_EVENT, REQUEST_STATUS) {
  // service methods
  var sessionService = {
    handshake: handshake,
    signIn: signIn,
    signOut: signOut,
    selectRestaurant: selectRestaurant,
    unselectRestaurant: unselectRestaurant,
    getSignedInUser: getSignedInUser,
    ifSignedInUserAuthorized: ifSignedInUserAuthorized,
    getSelectedRestaurant: getSelectedRestaurant,
    getTable: getTable,
    getRequests: getRequests,
    createTable: createTable,
    deleteTable: deleteTable,
    startRequest: startRequest,
    closeRequest: closeRequest,
    ifSocketReady: ifSocketReady
  };

  // locals
  var signedInUser = null;
  var selectedRestaurant = null;
  var getRequest = getRequest;
  var tables = new Array(10);
  for (var i = 0; i < 10; i++) {
    tables[i] = new Array(10);
  }
  var requests = [];
  var rcsSocket = null;
  var rcsSocketDataReady = false;
  var emitTableEvent = emitTableEvent;

  // initialize
  $rootScope.$on(RCS_EVENT.forbidden, function () {
    signedInUser = null;
  });

  // connect (force new connection, passing null as the 1st to let socket use the default url)
  $log.debug("rcsSocket: connecting...");
  rcsSocket = io.connect(null, { 'force new connection': true });

  // listen
  rcsSocket.on('connect', function () {
    $log.debug("rcsSocket: just connected!");
    rcsSocketConnected = true;
  });

  rcsSocket.on('init', function (msg) {
    $log.debug('rcsSocket: received init');
    $log.debug(msg);

    for (var i = msg.table.length - 1; i >= 0; i--) {
      var table = msg.table[i];
      tables[table.MapRow][table.MapCol] = table;
    }
    requests = msg.request;

    rcsSocketDataReady = true;
  });

  rcsSocket.on('restaurant', onRestaurantMessage);

  // defines
  function onRestaurantMessage (msg) {

    $log.debug('rcsSocket: received restaurant message');
    $log.debug(msg);

    if (msg.verb != 'messaged') {
      return $log.debug('rcsSocket: unsopported verb [' + msg.verb + '].');
    }

    var data = msg.data;

    // handle new-table
    if (data.newTable) {
      var table = data.newTable;
      tables[table.MapRow][table.MapCol] = table;
      emitTableEvent(table.MapRow, table.MapCol);
    }

    // handle new-request
    if (data.newRequest) {
      requests.push(data.newRequest);
      $rootScope.$emit(RCS_EVENT.requestsUpdate);
    }

    // handle remove-table
    if (data.removeTable) {
      var table = data.removeTable;
      tables[table.MapRow][table.MapCol] = null;
      emitTableEvent(table.MapRow, table.MapCol);
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

      $rootScope.$emit(RCS_EVENT.requestsUpdate);
    }

    // handle set-table
    if (data.setTable) {
      var table = data.setTable;
      tables[table.MapRow][table.MapCol] = table;
      emitTableEvent(table.MapRow, table.MapCol);
    }

    // handle set-request
    if (data.setRequest) {
      var requestToUpdate = data.setRequest;

      for (var i = requests.length - 1; i >= 0; i--) {
        if (requests[i].id == requestToUpdate.id) {
          requests[i] = requestToUpdate;
          break;
        }
      }

      $rootScope.$emit(RCS_EVENT.requestsUpdate);
    }
  }

  function emitTableEvent (mapRow, mapCol) {
    var tableEvent = '{0}({1},{2})'.format(RCS_EVENT.tableUpdate, mapRow, mapCol);
    $rootScope.$emit(tableEvent);
  }

  function handshake () {
    // >>> test
    // return rcsHttp.User.signIn('manager1@rcs.com', 'mgr123')
    //   .success(function (res) {
    //     signedInUser = res;
    //     // selectedRestaurant = {id: 21, RestaurantName: 'KFC'};
    //   });
    // <<< test

    return rcsHttp.User.handshake()
      .success(function (res) {
        signedInUser = null;
        if (res) {
          signedInUser = res;
        }
      });
  }

  function signIn (email, password, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.User.signIn(email, password)
      .success(function (res) {
        signedInUser = res;
        successAction();
      })
      .error(errorAction);
  }

  function signOut (successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    // >>> mock
    // signedInUser = null;
    // << mock

    rcsHttp.User.signOut()
      .success(function () {
        unselectRestaurant();
        signedInUser = null;
        successAction();
      })
      .error(errorAction);
  }

  function selectRestaurant (restaurant, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    selectedRestaurant = restaurant;

    // subscribe to restaurant message event
    return rcsSocket.get(
      '/Restaurant/subscribe',
      {RestaurantId: selectedRestaurant.id},
      function (result) {
        if (result && result.subscribedTo) {
          successAction();
        } else {
          errorAction();
        }
      });

    // >>> mock
    // tables[2][3] = {
    //   id: 1,
    //   TableName: 'A1',
    //   TableType: 'A',
    //   Status: 'empty',
    //   MapRow: 2,
    //   MapCol: 3,
    //   ActiveRequestCount: 0
    // };
    // tables[2][4] = {
    //   id: 2,
    //   TableName: 'A2',
    //   TableType: 'A',
    //   Status: 'paying',
    //   MapRow: 2,
    //   MapCol: 4,
    //   ActiveRequestCount: 1
    // };
    // tables[2][5] = {
    //   id: 3,
    //   TableName: 'A3',
    //   TableType: 'A',
    //   Status: 'paid',
    //   MapRow: 2,
    //   MapCol: 5,
    //   BookName: 'Shuyu',
    //   BookDateTime: new Date(),
    //   ActiveRequestCount: 2
    // };

    // requests = [{
    //   id: 1,
    //   Type: 'call',
    //   Status: 'new',
    //   Importance: 0,
    //   createdAt: new Date(),
    //   ClosedAt: new Date(),
    //   PayType: null,
    //   PayAmount: null,
    //   OrderItems: null,
    //   Table: {
    //     TableName: 'A3'
    //   }
    // }, {
    //   id: 2,
    //   Type: 'pay',
    //   Status: 'inProgress',
    //   Importance: 1,
    //   createdAt: new Date(),
    //   ClosedAt: new Date(),
    //   PayType: 'cash',
    //   PayAmount: 100,
    //   OrderItems: null,
    //   Table: {
    //     TableName: 'A2'
    //   }
    // }, {
    //   id: 3,
    //   Type: 'order',
    //   Status: 'new',
    //   Importance: 0,
    //   createdAt: new Date(),
    //   ClosedAt: new Date(),
    //   PayType: null,
    //   PayAmount: null,
    //   OrderItems: [1, 1, 1],
    //   Table: {
    //     TableName: 'A2'
    //   }
    // }, {
    //   id: 4,
    //   Type: 'water',
    //   Status: 'closed',
    //   Importance: 0,
    //   createdAt: new Date(),
    //   ClosedAt: new Date(),
    //   Table: {
    //     TableName: 'A2'
    //   }
    // }];
    // <<< mock
  }

  function unselectRestaurant (successAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    rcsSocket.get('/Restaurant/unsubscribe');

    selectedRestaurant = null;

    tables = new Array(10);
    for (var i = 0; i < 10; i++) {
      tables[i] = new Array(10);
    }

    requests = [];

    return successAction();
  }

  function getSignedInUser () {
    return signedInUser;
  }

  function ifSignedInUserAuthorized (allowedAuthorizations) {
    if (!signedInUser || !signedInUser.Role) {
      return false;
    }

    if (!angular.isArray(allowedAuthorizations)) {
      allowedAuthorizations = [allowedAuthorizations];
    }

    return allowedAuthorizations.indexOf(signedInUser.Role) != -1;
  }

  function getSelectedRestaurant () {
    return selectedRestaurant;
  }

  function getRequests () {
    return angular.copy(requests);
  }

  function getTable (row, col) {
    return angular.copy(tables[row][col]);
  }

  function createTable (row, col, table, successAction, errorAction) {
    // >>> mock
    tables[row][col] = table;
    // <<< mock

    if (angular.isFunction(successAction)) {
      successAction();
    }
  }

  function deleteTable (table, successAction, errorAction) {
    // >>> mock
    tables[table.MapRow][table.MapCol] = null;
    // <<< mock

    var tableEvent = '{0}({1},{2})'.format(RCS_EVENT.tableUpdate, table.MapRow, table.MapCol);
    $rootScope.$emit(tableEvent);

    if (angular.isFunction(successAction)) {
      successAction();
    }
  }

  function startRequest (request) {
    // >>> mock
    getRequest(request.id).Status = REQUEST_STATUS.inProgress;
    // <<< mock
    $rootScope.$emit(RCS_EVENT.requestsUpdate);
  }

  function closeRequest (request) {
    // >>> mock
    getRequest(request.id).Status = REQUEST_STATUS.closed;
    // <<< mock
    $rootScope.$emit(RCS_EVENT.requestsUpdate);
  }

  function getRequest (id) {
    for (var i = requests.length - 1; i >= 0; i--) {
      if (requests[i].id == id) {
        return requests[i];
      }
    };
  }

  function ifSocketReady () {
    return rcsSocketDataReady;
  }

  return sessionService;
}

function rcsHttp ($rootScope, $http, $state, $log, RCS_EVENT) {
  var httpService = {};

  var errorAction = function (data, status) {
    $log.error(data || 'request failed');
    if (status == 403) {
      $rootScope.$emit(RCS_EVENT.forbidden);
      $state.go('page.signin');
    }
  }

  rcsHttp.Restaurant = {
    list: function () {
      return $http
        .post('Restaurant/list')
        .error(errorAction);
    },
    create: function (restaurantName, description, admins) {
      if (!angular.isArray(admins)) {
        admins = [admins];
      }
      return $http
        .post('Restaurant/create', {
          RestaurantName: restaurantName,
          Description: description,
          Admins: admins
        })
        .error(errorAction);
    },
    addAdmin: function (restaurantId, adminEmail) {
      return $http
        .post('Restaurant/addAdmin', {
          RestaurantId: restaurantId,
          Admin: adminEmail
        })
        .error(errorAction);
    },
    removeAdmin: function (restaurantId, adminEmail) {
      return $http
        .post('Restaurant/removeAdmin', {
          RestaurantId: restaurantId,
          Admin: adminEmail
        })
        .error(errorAction);
    },
    listAdmin: function (restaurantId) {
      return $http
        .post('Restaurant/listAdmin', {
          RestaurantId: restaurantId
        })
        .error(errorAction);
    },
    listMenu: function (restaurantId) {
      return $http
        .post('Restaurant/listMenu', {
          RestaurantId: restaurantId
        })
        .error(errorAction);
    }
  }

  rcsHttp.User = {
    signIn: function (email, password) {
      return $http
        .post('User/login', {
          Email: email,
          Password: password
        })
        .error(errorAction);
    },
    signOut: function () {
      return $http
        .post('User/logout')
        .error(errorAction);
    },
    create: function (email, password, role, key, name) {
      return $http
        .post('User/create', {
          Email: email,
          Password: password,
          Role: role,
          Key: key,
          Name: name
        })
        .error(errorAction);
    },
    handshake: function () {
      return $http
        .post('User/handshake')
        .error(errorAction);
    }
  }

  rcsHttp.Table = {
    create: function (restaurantId, tableName, tableType, mapRow, mapCol) {
      return $http
        .post('/Table/create', {
          RestaurantId: restaurantId,
          TableName: tableName,
          TableType: tableType,
          MapRow: mapRow,
          MapCol: mapCol
        })
        .error(errorAction);
    },
    delete: function (tableId) {
      return $http
        .post('Table/delete/' + tableId)
        .error(errorAction);
    },
    reset: function (tableId) {
      return $http
        .post('Table/reset/' + tableId)
        .error(errorAction);
    },
    book: function (tableId, bookName, bookCell, bookDateTime) {
      return $http
        .post('Table/book/' + tableId, {
          BookName: bookName,
          BookCell: bookCell,
          BookDateTime: bookDateTime
        })
        .error(errorAction);
    },
    cancelBook: function (tableId) {
      return $http
        .post('Table/cancelBook/' + tableId)
        .error(errorAction);
    },
    removeLink: function (tableId) {
      return $http
        .post('Table/removeLink/' + tableId)
        .error(errorAction);
    },
    modifyOrder: function (tableId, orderItems) {
      return $http
        .post('Table/modifyOrder/' + tableId, {
          orderItems: orderItems
        })
        .error(errorAction);
    }
  }

  rcsHttp.Request = {
    list: function (restaurantId) {
      return $http
        .post('Request/list', {
          RestaurantId: restaurantId
        })
        .error(errorAction);
    },
    start: function (requestId) {
      return $http
        .post('Request/start/' + requestId)
        .error(errorAction);
    },
    close: function (requestId) {
      return $http
        .post('Request/close/' + requestId)
        .error(errorAction);
    }
  }

  rcsHttp.MenuItem = {
    create: function (restaurantId, name, type, price, premiumPrice) {
      return $http
        .post('MenuItem/create', {
          Name: name,
          Type: type,
          Price: price,
          PremiumPrice: premiumPrice,
          RestaurantId: restaurantId
        })
        .error(errorAction);
    },
    update: function (restaurantId, menuItemId, type, price, premiumPrice) {
      return $http
        .post('MenuItem/update/' + menuItemId, {
          Type: type,
          Price: price,
          PremiumPrice: premiumPrice,
          RestaurantId: restaurantId
        })
        .error(errorAction);
    },
    delete: function (restaurantId, menuItemId) {
      return $http
        .post('MenuItem/delete/' + menuItemId, {
          RestaurantId: restaurantId
        })
        .error(errorAction);
    }
  }

  return rcsHttp;
}