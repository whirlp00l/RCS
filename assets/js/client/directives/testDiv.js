angular
  .module('rcs')
  .directive('testDivParent', function ($state) {
    return {
      link: function ($scope) {
        $scope.title = 'Hello world!';
        var clickTime = 0;

        $scope.setTitle = function () {
          $scope.title = clickTime++;
        }

        $scope.gotoAdmin = function () {
          $state.go('admin');
        }
      }
    }
  })
  .directive('testDivChild', function () {
    return {
      scope: true,
      link: function ($scope, $element, $attr) {
        var clickTime = 0;
        $scope.setTitleChild = function () {
          $scope.title = clickTime++;
        }
      }
    }
  })
  .directive('testDiv', function (rcsAPI) {
    return {
      link: function ($scope) {
        $scope.listRestaurant = function () {
          rcsAPI.Restaurant.list().success(function (data) {
            console.log(data);
          });
        };

        $scope.createRestaurant = function () {
          rcsAPI.Restaurant.create('KFC-Test').success(function (data) {
            console.log(data);
          });
        };

        $scope.addAdmin = function () {
          rcsAPI.Restaurant.addAdmin('KFC-Test', 'admin1').success(function (data) {
            console.log(data);
          });
        };

        $scope.loginAdmin = function () {
          rcsAPI.User.login('admin1', 'adm123').success(function (data) {
            console.log(data);
          });
        };

        $scope.loginManager = function () {
          rcsAPI.User.login('manager1', 'mgr123').success(function (data) {
            console.log(data);
          });
        };

        $scope.create = function () {
          rcsAPI.User.create('admin2', 'adm123', 'admin').success(function (data) {
            console.log(data);
          });
        };

        $scope.logout = function () {
          rcsAPI.User.logout().success(function (data) {
            console.log(data);
          });
        };
      }
    }
  })
  .directive('ig', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        fid: '@',
        title: '@',
        type: '@',
        description: '=description'
      },
      template: '<div class="material-input-group">' +
                  '<label for="{{fid}}">{{title}}</label>' +
                  '<input id="{{fid}}" type="{{type}}" ng-model="description">' +
                '</div>'
    }
  });;
