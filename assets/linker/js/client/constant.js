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
  })
  .constant('TEXT', {
    removeAdmin: {
      title: '移除管理员: ',
      content: '移除后，该用户将无法继续管理餐厅',
    }
  })
  .constant('REQUEST_STATUS', {
    inProgress: 'inProgress',
    new: 'new',
    closed: 'closed'
  })
  .constant('REQUEST_TYPE', {
    call: 'call',
    pay: 'pay',
    water: 'water'
  });