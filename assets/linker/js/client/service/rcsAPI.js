angular
  .module('rcs')
  .service('rcsAPI', ['$http', '$state', '$log',
    function($http, $state, $log) {

      var rcsAPI = this;

      var errorAction = function (data, status) {
        $log.error(data || 'request failed');
      }

      // exposing
      rcsAPI.Restaurant = {
        list: function () {
          return $http
            .get('Restaurant/list')
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
        addAdmin: function (restaurantName, admin) {
          return $http
            .post('Restaurant/addAdmin', {
              RestaurantName: restaurantName,
              Admin: admin
            })
            .error(errorAction);
        },
        removeAdmin: function (restaurantName, admin) {
          return $http
            .post('Restaurant/removeAdmin', {
              RestaurantName: restaurantName,
              Admin: admin
            })
            .error(errorAction);
        },
        listAdmin: function (restaurantName) {
          return $http
            .post('Restaurant/listAdmin', {
              RestaurantName: restaurantName
            })
            .error(errorAction);
        },
      },

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
            .get('User/logout')
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
        }
      },

      rcsAPI.Table = {
        create: function (restaurantName, tableName, tableType, mapRow, mapCol) {
          return $http
            .post('/Table/create', {
              RestaurantName: restaurantName,
              TableName: tableName,
              TableType: tableType,
              MapRow: mapRow,
              MapCol: mapCol
            })
            .error(errorAction);
        },
        list: function (restaurantName) {
          return $http
            .post('Table/list', {
              RestaurantName: restaurantName
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
        }
      },

      rcsAPI.Request = {
        list: function (restaurantName) {
          return $http
            .post('Request/list', {
              RestaurantName: restaurantName
            })
            .error(errorAction);
        },
        start: function (requestId) {
          return $http
            .get('Request/start/' + requestId)
            .error(errorAction);
        },
        close: function (requestId) {
          return $http
            .get('Request/close/' + requestId)
            .error(errorAction);
        }
      }
    }]);