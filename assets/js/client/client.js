angular
  .module('rcs', [
    'ui.router',
    'ui.router.stateHelper',
    'ui.bootstrap',
    'ngMaterial',
    'rcsFilter'
  ])
  .config([
    '$urlRouterProvider',
    '$stateProvider',
    '$logProvider',
    'stateHelperProvider',
    'USER_ROLE',
    config
  ])
  .run(['$rootScope', '$state', '$stateParams', run]);
  // .run([
  //   '$rootScope',
  //   '$state',
  //   '$stateParams',
  //   'rcsAuth',
  //   'USER_ROLES',
  //   run
  // ]);


function config ($urlRouterProvider, $stateProvider, $logProvider, stateHelperProvider, USER_ROLE) {
  $logProvider.debugEnabled(true);

  $urlRouterProvider.otherwise('/about');

  stateHelperProvider.setNestedState({
    name: 'page',
    abscract: true,
    templateUrl: '/template/page',
    controller: 'pageCtrl',
    resolve: {
      handshake: function (rcsSession) {
        return rcsSession.handshake();
      }
    },
    data: {
      title: ''
    },
    children: [{
      name: 'signin',
      url: '/signin',
      templateUrl: 'template/page-signin',
      controller: 'signInCtrl',
      data: {
        icon: 'sign-in',
        title: '登录'
      },
    }, {
      name: 'about',
      url: '/about',
      templateUrl: 'template/page-about',
      data: {
        icon: 'info-circle',
        title: '关于'
      },
    }, {
      name: 'restaurant',
      abscract: true,
      template: '<div ui-view></div>',
      data: {
        title: '餐厅'
      },
      children: [{
        name: 'list',
        url: '/restaurant/list',
        templateUrl: '/template/page-restaurant-list',
        controller: 'listRestaurantCtrl',
        data: {
          icon: 'cutlery',
          title: '餐厅列表'
        }
      }, {
        name: 'new',
        url: '/restaurant/new',
        templateUrl: '/template/page-restaurant-new',
        controller: 'newRestaurantCtrl',
        data: {
          icon: 'plus-square',
          title: '新建餐厅',
          authorization: [USER_ROLE.manager]
        }
      }]
    }, {
      name: 'management',
      abscract: true,
      template: '<div ui-view></div>',
      data: {
        title: '管理'
      },
      children: [{
        name: 'monitor',
        url: '/management/monitor',
        templateUrl: '/template/page-management-monitor',
        controller: 'monitorCtrl',
        data: {
          icon: 'th',
          title: '餐桌+请求'
        }
      }, {
        name: 'authorMenu',
        url: '/management/authorMenu',
        templateUrl: '/template/page-management-authorMenu',
        controller: 'authorMenuCtrl',
        data: {
          icon: 'edit',
          title: '菜单'
        }
      }, {
        name: 'arrangeWaiter',
        url: '/management/arrangeWaiter',
        templateUrl: '/template/page-management-arrangeWaiter',
        controller: 'arrangeWaiterCtrl',
        data: {
          icon: 'male',
          title: '服务员'
        }
      }, {
        name: 'assignAdmin',
        url: '/management/assignAdmin',
        templateUrl: '/template/page-management-assignAdmin',
        controller: 'assignAdminCtrl',
        data: {
          icon: 'users',
          title: '分配管理员',
          authorization: [USER_ROLE.manager]
        }
      }]
    }]
  });


  // $stateProvider
  //   .state('login', {
  //     url: '/login',
  //     templateUrl: '/template/login',
  //     controller: 'loginCtrl',
  //     data: {
  //       name: '登录',
  //       authorizedRoles: [USER_ROLES.any]
  //     },
  //     resolve: {
  //       handshake: function (rcsAPI) {
  //         return rcsAPI.User.handshake().then(function (res) {
  //           return res.data;
  //         });
  //       }
  //     }
  //   })
  //   .state('signup', {
  //     url: '/signup',
  //     templateUrl: '/template/signup',
  //     controller: 'signupCtrl',
  //     data: {
  //       name: '注册',
  //       authorizedRoles: [USER_ROLES.any]
  //     },
  //   })
  //   .state('restaurant', {
  //     url: '/restaurant',
  //     templateUrl: '/template/restaurant',
  //     controller: 'restaurantCtrl',
  //     data: {
  //       name: '餐厅选择',
  //       authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager]
  //     },
  //     resolve: {
  //       restaurants: function (rcsAPI) {
  //         return rcsAPI.Restaurant.list().then(function (res) {
  //           return res.data.Restaurants;
  //         });
  //       }
  //     }
  //   })
  //   .state('newRestaurant', {
  //     url: '/Restaurant/new',
  //     templateUrl: '/template/newRestaurant',
  //     controller: 'newRestaurantCtrl',
  //     data: {
  //       name: '餐厅创建',
  //       authorizedRoles: [USER_ROLES.manager]
  //     }
  //   })
  //   .state('admin', {
  //     url: '/admin/:restaurantId',
  //     templateUrl: '/template/admin',
  //     controller: 'adminCtrl',
  //     data: {
  //       name: '管理员分配',
  //       authorizedRoles: [USER_ROLES.manager]
  //     },
  //     resolve: {
  //       admins: function ($stateParams, rcsAPI) {
  //         return rcsAPI.Restaurant.listAdmin($stateParams.restaurantId)
  //           .then(function (res) {
  //             return res.data.Admins;
  //           });
  //       }
  //     }
  //   })
  //   .state('home', {
  //     url: '/Restaurant/:restaurantId',
  //     templateUrl: '/template/home',
  //     controller: 'homeCtrl',
  //     data: {
  //       name: '餐厅管理',
  //       authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager]
  //     }
  //   })
  //   .state('menu', {
  //     url: '/Menu/:restaurantId',
  //     templateUrl: 'template/menu',
  //     controller: 'menuCtrl',
  //     data: {
  //       name: '编辑菜单',
  //       authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager]
  //     },
  //     resolve: {
  //       menu: function ($stateParams, rcsAPI) {
  //         return rcsAPI.Restaurant.listMenu($stateParams.restaurantId)
  //           .then(function (res) {
  //             return res.data.Menu;
  //           });
  //       }
  //     }
  //   })
  //   .state('test', {
  //     url: '/test',
  //     templateUrl: '/template/test',
  //     data: {
  //       name: 'test',
  //       authorizedRoles: [USER_ROLES.any]
  //     }
  //   });
}

function run ($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}

// function run ($rootScope, $state, $stateParams, rcsAuth, USER_ROLES) {
//    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
//     $state.previous = {
//       state: fromState,
//       params: fromParams
//     }
//   });

//   $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
//     // handshake with server
//     rcsAuth.handshake();

//     // track the state the user wants to go to; authorization service needs this
//     var authorizedRoles = toState.data.authorizedRoles;

//     if (!authorizedRoles) {
//       return;
//     }

//     if (!angular.isArray(authorizedRoles)) {
//       authorizedRoles = [authorizedRoles];
//     }

//     if (authorizedRoles.indexOf(USER_ROLES.any) !== -1) {
//       return;
//     }

//     if (!rcsAuth.isAuthorized(authorizedRoles)) {
//       event.preventDefault();
//       if (rcsAuth.isAuthenticated()) {
//         // user is not allowed
//         $state.go('login');
//       } else {
//         // user is not logged in
//         $state.go('login');
//       }
//     }
//   });
// }