angular
  .module('rcs')
  .factory('sailsSocket', ['$rootScope', function($rootScope) {
    return io.connect();
}]);