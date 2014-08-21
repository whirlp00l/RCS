angular
  .module('rcs')
  .factory('rcsAuth', ['$rootScope', '$http', 'SessionService', 'AUTH_EVENTS', 'USER_ROLES', 'rcsAPI',
    function ($rootScope, $http, SessionService, AUTH_EVENTS, USER_ROLES, rcsAPI) {

      var authService = {};

      authService.login = function (credentials) {
        return rcsAPI.User.login(credentials.email, credentials.password)
          .success(function (user) {
            SessionService.create(user.Email, user.Role);
            $rootScope.$emit(AUTH_EVENTS.loginSuccess);
          });
      };

      authService.logout = function (cb) {
        if (!authService.isAuthenticated()) {
          return cb();
        }

        return rcsAPI.User.logout()
          .success(function () {
            SessionService.destroy();
            $rootScope.$emit(AUTH_EVENTS.logoutSuccess);
            cb();
          });
      };

      authService.handshake = function () {
        return rcsAPI.User.handshake()
          .success(function (user) {
            SessionService.destroy();
            if (user) {
              // user logged in
              SessionService.create(user.Email, user.Role);
              $rootScope.$emit(AUTH_EVENTS.loginSuccess);
            } else {
              // no user logged in
              $rootScope.$emit(AUTH_EVENTS.logoutSuccess);
            }
          });
      }

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