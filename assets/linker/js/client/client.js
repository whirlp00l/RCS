angular
  .module('rcs', [
    'ui.router', 'ui.bootstrap'
  ])
  .config(['$urlRouterProvider', '$stateProvider',
    function($urlRouterProvider, $stateProvider){
      $urlRouterProvider.otherwise('/login');

      $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: '/angular/login',
          controller: 'loginCtrl'
        })
        .state('restaurant', {
          url: '/restaurant',
          templateUrl: '/angular/restaurant',
          controller: 'restaurantCtrl',
          data: {
            name: '餐厅选择'
          },
          resolve: {
            restaurants: function ($http) {
              return $http.get('Restaurant/list').then(function (data) {
                return data.data;
              });
            }
          }
        })
        .state('admin', {
          url: '/admin/:restaurantName',
          templateUrl: '/angular/admin',
          controller: 'adminCtrl',
          data: {
            name: '管理员分配'
          }
        })
        .state('home', {
          url: '/home/:restaurantName',
          templateUrl: '/angular/home',
          controller: 'homeCtrl',
          data: {
            name: '餐厅管理'
          }
        })
        .state('test', {
          url: '/test',
          templateUrl: '/angular/test',
        });
    }]
  )
  .run(['$rootScope', '$state', '$stateParams', 'AuthService',
    function($rootScope, $state, $stateParams, AuthService) {
       $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $state.previous = {
          state: fromState,
          params: fromParams
        }
      });

      // $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
      //   // track the state the user wants to go to; authorization service needs this
      //   console.log('stateChangeStart:');
      //   console.log(toState);
      //   console.log(toStateParams);

      //   if(toStateParams.x) {
      //     return;
      //   }

      //   if (toState.name != 'login' && toState.name != 'test') {         
      //     event.preventDefault();

      //     AuthService.checkRole().then(
      //       function success () {
      //         console.log("auth pass. go ahead");
      //         $state.go(toState.name, {
      //           x: 1
      //         });
      //       }, 
      //       function fail () {
              
      //         console.log("auth failed. force to login page")
      //         $state.go('login');
      //       });
      //   }
      // });
    }
  ]);