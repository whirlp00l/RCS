angular
  .module('rcs')
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })
  .constant('USER_ROLES', {
    any: '*',
    manager: 'manager',
    admin: 'admin'
  })
  .constant('ERROR_MESSAGE', {
    passwordMismatch: '密码确认有误 请重新输入'
  });