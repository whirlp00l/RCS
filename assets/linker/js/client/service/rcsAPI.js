angular
  .module('rcs')
  .service('rcsAPI', ['$http', '$state', '$log',
    function($http, $state, $log) {

      var rcsAPI = this;

      var errorAction = function (data, status) {
        $log.error(data || 'request failed');
        if (status == 403) {
          $state.go('login');
        }
      }

      // exposing
      rcsAPI.Restaurant = {
        list: function () {
          return $http
            .post('Restaurant/list')
            .error(errorAction);
        },
        create: function (restaurantName, admins) {
          if (!angular.isArray(admins)) {
            admins = [admins];
          }
          return $http
            .post('Restaurant/create', {
              RestaurantName: restaurantName,
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

      rcsAPI.User = {
        login: function (email, password) {
          return $http
            .post('User/login', {
              Email: email,
              Password: password
            })
            .error(errorAction);
        },
        logout: function () {
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

      rcsAPI.Table = {
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

      rcsAPI.Request = {
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

      rcsAPI.MenuItem = {
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

    }]);