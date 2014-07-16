angular
  .module('rcs')
  .factory('AuthService', ['$rootScope', '$http', 'SessionService', 'AUTH_EVENTS', 'USER_ROLES',
    function ($rootScope, $http, SessionService, AUTH_EVENTS, USER_ROLES) {

      var authService = {};

      authService.login = function (credentials) {
        return $http
          .post('User/login', {
            Email: credentials.email,
            Password: credentials.password
          })
          .then(function (data) {
            var user = data.data;
            SessionService.create(user.Email, user.Role);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
          });
      };

      authService.logout = function () {
        return $http
          .get('User/logout')
          .then(function (data) {
            SessionService.destroy();
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
          });
      };

      authService.isAuthenticated = function () {
        return !!SessionService.user;
      };

      authService.isAuthorized = function (authorizedRoles) {
        if (!authService.isAuthenticated()) {
          return false;
        }

        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }
        return (authService.isAuthenticated() &&
          authorizedRoles.indexOf(SessionService.userRole) !== -1);
      };

      authService.isManager = function () {
        return authService.isAuthorized(USER_ROLES.manager)
      };

      return authService;

    }])