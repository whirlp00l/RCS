angular
  .module('rcs')
  .factory('AuthService', function ($http) {
    return {
      login: function (credentials) {
        return $http
          .post('User/login', {
            Email: credentials.email,
            Password: credentials.password
          })
          .then(function (data) {
            console.log('login success.')
            console.log(data);
            // Session.create(data.id, data.email, data.role);
          });
      },

      logout: function () {
        return $http
          .get('User/logout')
          .then(function (data) {
            console.log('logout success.')
            console.log(data);
            // Session.clear();
          });
      },
      // ,
      // isAuthenticated: function () {
      //   return !!Session.userId;
      // },
      // isAuthorized: function (authorizedRoles) {
      //   if (!angular.isArray(authorizedRoles)) {
      //     authorizedRoles = [authorizedRoles];
      //   }
      //   return (this.isAuthenticated() &&
      //     authorizedRoles.indexOf(Session.userRole) !== -1);
      // }
    };
  })