angular
  .module('rcs')
  .factory('rcsHttp', ['$http', '$state', '$log', rcsHttp])
  .factory('rcsSession', ['$rootScope', 'rcsHttp', 'RCS_EVENT', 'REQUEST_STATUS', rcsSession]);

function rcsSession ($rootScope, rcsHttp, RCS_EVENT, REQUEST_STATUS) {
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
    closeRequest: closeRequest
  };

  var signedInUser = null;
  var selectedRestaurant = null;
  var getRequest = getRequest;

  var tables = new Array(10);
  for (var i = 0; i < 10; i++) {
    tables[i] = new Array(10);
  }

  var requests = [];

  // initialize

  // signedInUser = {Email: 'admin1', Role: 'admin'};
  // selectedRestaurant = {id: 1, RestaurantName: 'MZDP'};

  // initialize rcsSocket

  // defines
  function handshake () {
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

    // >>> mock
    // signedInUser = {Email: 'admin1', Role: 'admin'};
    // << mock

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

    // >>> mock
    tables[2][3] = {
      id: 1,
      TableName: 'A1',
      TableType: 'A',
      Status: 'empty',
      MapRow: 2,
      MapCol: 3,
      ActiveRequestCount: 0
    };
    tables[2][4] = {
      id: 2,
      TableName: 'A2',
      TableType: 'A',
      Status: 'paying',
      MapRow: 2,
      MapCol: 4,
      ActiveRequestCount: 1
    };
    tables[2][5] = {
      id: 3,
      TableName: 'A3',
      TableType: 'A',
      Status: 'paid',
      MapRow: 2,
      MapCol: 5,
      BookName: 'Shuyu',
      BookDateTime: new Date(),
      ActiveRequestCount: 2
    };

    requests = [{
      id: 1,
      Type: 'call',
      Status: 'new',
      Importance: 0,
      createdAt: new Date(),
      ClosedAt: new Date(),
      PayType: null,
      PayAmount: null,
      OrderItems: null,
      Table: {
        TableName: 'A3'
      }
    }, {
      id: 2,
      Type: 'pay',
      Status: 'inProgress',
      Importance: 1,
      createdAt: new Date(),
      ClosedAt: new Date(),
      PayType: 'cash',
      PayAmount: 100,
      OrderItems: null,
      Table: {
        TableName: 'A2'
      }
    }, {
      id: 3,
      Type: 'order',
      Status: 'new',
      Importance: 0,
      createdAt: new Date(),
      ClosedAt: new Date(),
      PayType: null,
      PayAmount: null,
      OrderItems: [1, 1, 1],
      Table: {
        TableName: 'A2'
      }
    }, {
      id: 4,
      Type: 'water',
      Status: 'closed',
      Importance: 0,
      createdAt: new Date(),
      ClosedAt: new Date(),
      Table: {
        TableName: 'A2'
      }
    }];
    // <<< mock

    // socket connect
    // subscribe
    successAction();
  }

  function unselectRestaurant (successAction) {
    // >>> mock
    selectedRestaurant = null;
    // << mock

    tables = new Array(10);
    for (var i = 0; i < 10; i++) {
      tables[i] = new Array(10);
    }

    requests = [];
    // unsubscribe
    // socket disconnect
    if (angular.isFunction(successAction)) {
      successAction();
    }
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

    var tableEvent = '{0}({1},{2})'.format(RCS_EVENT.tableUpdate, row, col);
    $rootScope.$emit(tableEvent);

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

  return sessionService;
}

function rcsHttp ($http, $state, $log) {
  var httpService = {};

  var errorAction = function (data, status) {
    $log.error(data || 'request failed');
    if (status == 403) {
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
    addAdmin: function (restaurantId, admin) {
      return $http
        .post('Restaurant/addAdmin', {
          RestaurantId: restaurantId,
          Admin: admin
        })
        .error(errorAction);
    },
    removeAdmin: function (restaurantId, admin) {
      return $http
        .post('Restaurant/removeAdmin', {
          RestaurantId: restaurantId,
          Admin: admin
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
    create: function (email, password, role, key) {
      return $http
        .post('User/create', {
          Email: email,
          Password: password,
          Role: role,
          Key: key
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