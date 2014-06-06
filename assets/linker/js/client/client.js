angular
  .module('rcs', [
    'ui.router'
  ])
  .config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/linker/js/client/views/home.html',
        controller: 'homeCtrl'
      })
      .state('table', {
        url: '/table',
        templateUrl: '/linker/js/client/views/table.html',
        controller: 'tableCtrl',
        // resolve: {
        //   restaurantName: ['$stateParams', function($stateParams) {
        //     return $stateParams.restaurantName;
        //   }],
        //   tablesInRestaurant: ['$http', function($http, $stateParams) {
        //     return $http.get('/table').then(function(res){
        //       return res.data;
        //     })
        //   }]
        // }
      })
      // .state('listRestaurants', {
      //   url: '/listRestaurants',
      //   templateUrl: '/client/views/restaurants.html',
      //   controller: 'listRestaurantsCtrl',
      //   resolve: {
      //     restaurants: ['$http', function($http) {
      //       window.scrollTo(0,1);
      //       return $http.get('/api/listRestaurants').then(function(res){
      //         return res.data;
      //       })
      //     }]
      //   }
      // })
      // .state('newRestaurant', {
      //   url: '/newRestaurant',
      //   templateUrl: '/client/views/newRestaurant.html',
      //   controller: 'newRestaurantCtrl'
      // })
      // .state('listTables', {
      //   url: '/listTables/:restaurantName',
      //   templateUrl: '/client/views/tables.html',
      //   controller: 'listTablesCtrl',
      //   resolve: {
      //     restaurantName: ['$stateParams', function($stateParams) {
      //       return $stateParams.restaurantName;
      //     }],
      //     tablesInRestaurant: ['$http', '$stateParams', function($http, $stateParams) {
      //       return $http.get('/api/listTables/' + $stateParams.restaurantName).then(function(res){
      //         return res.data;
      //       })
      //     }]
      //   }
      // });
    }]
  );