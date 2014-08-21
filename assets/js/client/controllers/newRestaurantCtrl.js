angular
  .module('rcs')
  .controller('newRestaurantCtrl', ['$scope', '$state', 'rcsAPI', 'ERROR_MESSAGE',
    function ($scope, $state, rcsAPI, ERROR_MESSAGE) {
      console.log('signupCtrl');

      $scope.admins = [{name: null, show:false}];


      var cancelled = false
      $scope.createRestaurant = function (name, admins) {
        if (cancelled) {
          return;
        }

        var adminList = [];
        for (var i = admins.length - 2; i >= 0; i--) {
          adminList.push(admins[i].name);
        }

        rcsAPI.Restaurant.create(name, adminList)
          .success(function () {
            $state.go('restaurant');
          })
      }

      $scope.addAdmin = function (index) {
        $scope.admins[index].show = true;
        $scope.admins.push({name: null, show:false})
      }

      $scope.removeAdmin = function (index) {
        $scope.admins.splice(index, 1);
      }

      $scope.showPlus = function (index) {
        var admin = $scope.admins[index];
        return !admin.show && $scope.admins.length < 4;
      }

      $scope.showMinus = function (index) {
        var admin = $scope.admins[index];
        return admin.show;
      }

      $scope.cancel = function () {
        cancelled = true;
        $state.go('restaurant');
      }
    }]);