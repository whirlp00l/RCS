angular
  .module('rcs')
  .factory('rcsSession', ['$rootScope', 'RCS_EVENT', 'REQUEST_STATUS', rcsSession]);

function rcsSession ($rootScope, RCS_EVENT, REQUEST_STATUS) {
  var sessionService = {
    signIn: signIn,
    signOut: signOut,
    selectRestaurant: selectRestaurant,
    unselectRestaurant: unselectRestaurant,
    getSignedInUser: getSignedInUser,
    getSelectedRestaurant: getSelectedRestaurant,
    getTable: getTable,
    getRequests: getRequests,
    createTable: createTable,
    deleteTable: deleteTable,
    startRequest: startRequest,
    closeRequest: closeRequest
  };

  var signInUser = null;
  var selectedRestaurant = null;
  var getRequest = getRequest;

  var tables = new Array(10);
  for (var i = 0; i < 10; i++) {
    tables[i] = new Array(10);
  }

  var requests = [];

  // signInUser = {Email: 'admin1', Role: 'admin'};
  // selectedRestaurant = {id: 1, RestaurantName: 'MZDP'};

  // initialize rcsSocket

  function signIn (email, password, successAction, errorAction) {
    // >>> mock
    signInUser = {Email: 'admin1', Role: 'admin'};
    // << mock

    if (angular.isFunction(successAction)) {
      successAction();
    }

    return;

    if (angular.isFunction(errorAction)) {
      errorAction();
    }
  }

  function signOut (successAction) {
    // >>> mock
    signInUser = null;
    // << mock
    unselectRestaurant();

    if (angular.isFunction(successAction)) {
      successAction();
    }
  }

  function selectRestaurant (successAction) {
    // >>> mock
    selectedRestaurant = {id: 1, RestaurantName: 'MZDP'};

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
    if (angular.isFunction(successAction)) {
      successAction();
    }
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
    return signInUser;
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