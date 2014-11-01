angular
  .module('rcs')
  .factory('rcsHttp', ['$rootScope', '$http', '$state', '$log', 'RCS_EVENT', rcsHttp])
  .factory('rcsSession', ['$rootScope', '$state', '$log', 'rcsHttp', 'RCS_EVENT', 'REQUEST_STATUS', rcsSession]);

function rcsSession ($rootScope, $state, $log, rcsHttp, RCS_EVENT, REQUEST_STATUS) {
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
    getTables: getTables,
    getTable: getTable,
    getTableByName: getTableByName,
    getRequests: getRequests,
    getMenuItems: getMenuItems,
    getWaiters: getWaiters,
    getFlavorRequirements: getFlavorRequirements,
    createTable: createTable,
    deleteTable: deleteTable,
    resetTable: resetTable,
    unlinkTable: unlinkTable,
    bookTable: bookTable,
    unbookTable: unbookTable,
    startRequest: startRequest,
    closeRequest: closeRequest,
    toggleWaiterBusy: toggleWaiterBusy,
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
  var menuItems = [];
  var waiters = [];
  var flavorRequirements = [];
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

  rcsSocket.on('disconnect', function () {
    $log.debug("rcsSocket: just disconnect!");
    rcsSocketConnected = false;
    $state.go('page.restaurant.list');
  });

  rcsSocket.on('init', function (msg) {
    $log.debug('rcsSocket: received init');
    $log.debug(msg);

    for (var i = msg.table.length - 1; i >= 0; i--) {
      var table = msg.table[i];
      tables[table.MapRow][table.MapCol] = table;
    }
    requests = msg.request;
    menuItems = msg.menuItems;
    waiters = msg.waiters;
    flavorRequirements = msg.flavorRequirements;

    rcsSocketDataReady = true;
    $rootScope.$emit(RCS_EVENT.socketReady);
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

    // handle set-table
    if (data.setTable) {
      var table = data.setTable;
      tables[table.MapRow][table.MapCol] = table;
      emitTableEvent(table.MapRow, table.MapCol);
    }

    // handle remove-table
    if (data.removeTable) {
      var table = data.removeTable;
      tables[table.MapRow][table.MapCol] = null;
      emitTableEvent(table.MapRow, table.MapCol);
    }

    // handle new-request
    if (data.newRequest) {
      requests.push(data.newRequest);
      $rootScope.$emit(RCS_EVENT.requestsUpdate);
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

    // handle new-menuItem
    if (data.newMenuItem) {
      menuItems.push(data.newMenuItem);

      // there is no one listen to this event yet
      // $rootScope.$emit(RCS_EVENT.menuItemsUpdate);
    }

    // handle set-menuItem
    if (data.setMenuItem) {
      var idToUpdate = data.setMenuItem.id;
      for (var i = menuItems.length - 1; i >= 0; i--) {
        if (menuItems[i].id == idToUpdate) {
          menuItems[i] = data.setMenuItem;
          break;
        }
      };

      // $rootScope.$emit(RCS_EVENT.menuItemsUpdate);
    }

    // handle remove-menuItem
    if (data.removeMenuItemId) {
      var idToRemove = data.removeMenuItemId;
      for (var i = menuItems.length - 1; i >= 0; i--) {
        if (menuItems[i].id == idToRemove) {
          menuItems.splice(i, 1);
          break;
        }
      };

      // $rootScope.$emit(RCS_EVENT.menuItemsUpdate);
    }

    // handle new-waiter
    if (data.newWaiter) {
      waiters.push(data.newWaiter);

      $rootScope.$emit(RCS_EVENT.waitersUpdate);
    }

    // handle set-waiter
    if (data.setWaiter) {
      var idToUpdate = data.setWaiter.id;
      for (var i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i].id == idToUpdate) {
          waiters[i] = data.setWaiter;
          break;
        }
      };

      $rootScope.$emit(RCS_EVENT.waitersUpdate);
    }

    // handle remove-waiter
    if (data.removeWaiterId) {
      var idToRemove = data.removeWaiterId;
      for (var i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i].id == idToRemove) {
          waiters.splice(i, 1);
          break;
        }
      };

      $rootScope.$emit(RCS_EVENT.waitersUpdate);
    }

    // handle set-flavorRequirements
    if (data.setFlavorRequirements) {
      flavorRequirements = data.setFlavorRequirements;

      // $rootScope.$emit(RCS_EVENT.flavorRequirementsUpdate);
    }
  }

  function emitTableEvent (mapRow, mapCol) {
    var tableEvent = '{0}({1},{2})'.format(RCS_EVENT.tableUpdate, mapRow, mapCol);
    $rootScope.$emit(tableEvent);
  }

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

  function getTables () {
    return angular.copy(tables);
  }

  function getTable (row, col) {
    return angular.copy(tables[row][col]);
  }

  function getTableByName (name) {
    for (var row = tables.length - 1; row >= 0; row--) {
      for (var col = tables[row].length - 1; col >= 0; col--) {
        if (tables[row][col] && tables[row][col].TableName == name) {
          return tables[row][col];
        }
      }
    }

    return null;
  }

  function getMenuItems () {
    return angular.copy(menuItems);
  }

  function getWaiters () {
    return angular.copy(waiters);
  }

  function getFlavorRequirements () {
    return angular.copy(flavorRequirements);
  }

  function createTable (row, col, tableName, tableType, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.Table.create(
      selectedRestaurant.id,
      tableName,
      tableType,
      row,
      col).success(successAction).error(errorAction);
  }

  function deleteTable (table, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.Table.delete(table.id).success(successAction).error(errorAction);
  }

  function resetTable (table, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.Table.reset(table.id).success(successAction).error(errorAction);
  }

  function unlinkTable (table, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.Table.removeLink(table.id).success(successAction).error(errorAction);
  }

  function bookTable (table, bookName, bookCell, bookDateTime, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.Table.book(table.id, bookName, bookCell, bookDateTime)
      .success(successAction).error(errorAction);
  }

  function unbookTable (table, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.Table.cancelBook(table.id).success(successAction).error(errorAction);
  }

  function startRequest (request, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.Request.start(request.id).success(successAction).error(errorAction);
  }

  function closeRequest (request, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.Request.close(request.id).success(successAction).error(errorAction);
  }

  function toggleWaiterBusy (waiter, successAction, errorAction) {
    if (!angular.isFunction(successAction)) {
      successAction = function () {};
    }

    if (!angular.isFunction(errorAction)) {
      errorAction = function () {};
    }

    rcsHttp.Waiter
      .updateBusy(waiter.Restaurant, waiter.id, !waiter.Busy)
      .success(successAction)
      .error(errorAction);
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
    $log.debug(data || 'request failed');
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
    },
    listWaiter: function (restaurantId) {
      return $http
        .post('Restaurant/listWaiter', {
          RestaurantId: restaurantId
        })
        .error(errorAction);
    },
    updateFlavorRequirements: function (restaurantId, newRequirements) {
      return $http
        .post('Restaurant/updateFlavorRequirements', {
          RestaurantId: restaurantId,
          FlavorRequirements: newRequirements
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
    create: function (restaurantId, name, type, price, premiumPrice, alias, flavor) {
      return $http
        .post('MenuItem/create', {
          Name: name,
          Type: type,
          Price: price,
          PremiumPrice: premiumPrice,
          Alias: alias,
          Flavor: flavor,
          RestaurantId: restaurantId
        })
        .error(errorAction);
    },
    update: function (restaurantId, menuItemId, type, price, premiumPrice, alias, flavor, isRecommended) {
      return $http
        .post('MenuItem/update/' + menuItemId, {
          Type: type,
          Price: price,
          PremiumPrice: premiumPrice,
          Alias: alias,
          Flavor: flavor,
          IsRecommended: isRecommended,
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

  rcsHttp.Waiter = {
    create: function (restaurantId, name) {
      return $http
        .post('Waiter/create', {
          Name: name,
          RestaurantId: restaurantId
        })
        .error(errorAction);
    },
    updateOnline: function (restaurantId, waiterId, isOnline) {
      return $http
        .post('Waiter/update/' + waiterId, {
          Online: isOnline,
          RestaurantId: restaurantId
        })
        .error(errorAction);
    },
    updateBusy: function (restaurantId, waiterId, isBusy) {
      return $http
        .post('Waiter/update/' + waiterId, {
          Busy: isBusy,
          RestaurantId: restaurantId
        })
        .error(errorAction);
    },
    delete: function (restaurantId, waiterId) {
      return $http
        .post('Waiter/delete/' + waiterId, {
          RestaurantId: restaurantId
        })
        .error(errorAction);
    }
  }

  return rcsHttp;
}