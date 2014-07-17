angular
  .module('rcs')
  .service('rcsAPI', ['$http', '$state', 
    function($http, $state) {

      var rcsAPI = this;

      var errorAction = function (data, status) {
        console.log(data || 'request failed');
        alert(status);
      }

      // exposing
      rcsAPI.Restaurant = {
        list: function () {
          return $http
            .get('Restaurant/list')
            .error(errorAction);
        },
        create: function (restaurantName) {
          return $http
            .post('Restaurant/create', {
              RestaurantName: restaurantName
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
        }
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
        create: function (email, password, role) {
          return $http
            .post('User/create', {
              Email: email,
              Password: password,
              Role: role
            })
            .error(errorAction);
        }
      }
  }]);