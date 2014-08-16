angular
  .module('rcs', [
    'ui.router', 'ui.bootstrap', 'ngMaterial', 'ui.date'
  ])
  .config(['$urlRouterProvider', '$stateProvider', '$logProvider', 'USER_ROLES',
    function($urlRouterProvider, $stateProvider, $logProvider, USER_ROLES){
      $logProvider.debugEnabled(true);
      $urlRouterProvider.otherwise('/login');

      $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: '/template/login',
          controller: 'loginCtrl',
          data: {
            name: '登录',
            authorizedRoles: [USER_ROLES.any]
          },
        })
        .state('signup', {
          url: '/signup',
          templateUrl: '/template/signup',
          controller: 'signupCtrl',
          data: {
            name: '注册',
            authorizedRoles: [USER_ROLES.any]
          },
        })
        .state('restaurant', {
          url: '/restaurant',
          templateUrl: '/template/restaurant',
          controller: 'restaurantCtrl',
          data: {
            name: '餐厅选择',
            authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager]
          },
          resolve: {
            restaurants: function (rcsAPI) {
              return rcsAPI.Restaurant.list().then(function (res) {
                return res.data.Restaurants;
              });
            }
          }
        })
        .state('newRestaurant', {
          url: '/Restaurant/new',
          templateUrl: '/template/newRestaurant',
          controller: 'newRestaurantCtrl',
          data: {
            name: '餐厅创建',
            authorizedRoles: [USER_ROLES.manager]
          }
        })
        .state('admin', {
          url: '/admin/:restaurantId',
          templateUrl: '/template/admin',
          controller: 'adminCtrl',
          data: {
            name: '管理员分配',
            authorizedRoles: [USER_ROLES.manager]
          },
          resolve: {
            admins: function ($stateParams, rcsAPI) {
              return rcsAPI.Restaurant.listAdmin($stateParams.restaurantId)
                .then(function (res) {
                  return res.data.Admins;
                });
            }
          }
        })
        .state('home', {
          url: '/Restaurant/:restaurantId',
          templateUrl: '/template/home',
          controller: 'homeCtrl',
          data: {
            name: '餐厅管理',
            authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager]
          }
        })
        .state('menu', {
          url: '/Menu/:restaurantId',
          templateUrl: 'template/menu',
          controller: 'menuCtrl',
          data: {
            name: '编辑菜单',
            authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager]
          },
          resolve: {
            menu: function ($stateParams, rcsAPI) {
              return rcsAPI.Restaurant.listMenu($stateParams.restaurantId)
                .then(function (res) {
                  return res.data.Menu;
                });
            }
          }
        })
        .state('test', {
          url: '/test',
          templateUrl: '/template/test',
          data: {
            name: 'test',
            authorizedRoles: [USER_ROLES.any]
          }
        });
    }]
  )
  .run(['$rootScope', '$state', '$stateParams', 'AuthService', 'USER_ROLES',
    function($rootScope, $state, $stateParams, AuthService, USER_ROLES) {
       $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $state.previous = {
          state: fromState,
          params: fromParams
        }
      });

      $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
        // handshake with server
        AuthService.handshake();

        // track the state the user wants to go to; authorization service needs this
        var authorizedRoles = toState.data.authorizedRoles;

        if (!authorizedRoles) {
          return;
        }

        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }

        if (authorizedRoles.indexOf(USER_ROLES.any) !== -1) {
          return;
        }

        if (!AuthService.isAuthorized(authorizedRoles)) {
          event.preventDefault();
          if (AuthService.isAuthenticated()) {
            // user is not allowed
            $state.go('login');
          } else {
            // user is not logged in
            $state.go('login');
          }
        }
      });
    }
  ]);