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
  .constant('RCS_EVENTS', {
    editModeOn: 'edit-mode-on',
    editModeOff: 'edit-mode-off',
    tablesUpdate: 'tables-update',
    requestsUpdate: 'requests-update',
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
    },
    removeMenuItem: {
      title: '删除菜品: ',
      content: '确认从菜单中删除？',
    }
  })
  .constant('REQUEST_STATUS', {
    inProgress: 'inProgress',
    new: 'new',
    closed: 'closed'
  })
  .constant('REQUEST_TYPE', {
    call: 'call',
    callText: '呼叫服务',
    pay: 'pay',
    payText: '请求结账',
    water: 'water',
    waterText: '请求加水',
    order: 'order',
    orderText: '提交点菜'
  })
  .constant('TABLE_STATUS', {
    empty: 'empty',
    emptyText: '空桌',
    ordering: 'ordering',
    orderingText: '正在点菜',
    ordered: 'ordered',
    orderedText: '正在用餐',
    paying: 'paying',
    payingText: '正在结帐',
    paid: 'paid',
    paidText: '已结帐'
  });