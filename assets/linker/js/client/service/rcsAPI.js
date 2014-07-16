angular
  .module('rcs')
  .service('rcsAPI', ['$http', '$state', 'AuthService', 
    function($http, $state, AuthService) {

      var rcsAPI = this;

      // exposing
      rcsAPI.Restaurant = {
        get: function () {
          return $http
            .get('Restaurant')
            .then(function (data, status) {
              console.log(status);
              console.log(data);
              return data.data;
            });
        }
      }
  }]);