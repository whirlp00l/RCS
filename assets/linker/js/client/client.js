angular
  .module('rcs', [
    'ui.router', 'ui.bootstrap'
  ])
  .config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/angular/home',
        controller: 'homeCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: '/angular/login',
        controller: 'loginCtrl'
      })
      .state('test', {
        url: '/test',
        templateUrl: '/angular/test',
      })
    }]
  );