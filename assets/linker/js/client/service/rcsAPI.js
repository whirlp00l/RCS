angular
  .module('rcs')
  .service('rcsAPI', ['$http', '$state', '$log',
    function($http, $state, $log) {

      var rcsAPI = this;

      var errorAction = function (data, status) {
        if (status === 400) {
          $log.error(data.validationErrors || 400)
        } else {
          $log.error(data || 'request failed');
        }
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
        }
      },

      rcsAPI.Request = {
        list: function (restaurantName) {
          return $http
            .post('Request/list', {
              RestaurantName: restaurantName
            })
            .error(errorAction);
        }
      }
    }]);