angular
  .module('rcs')
  .controller('restaurantCtrl', ['$scope', '$state', 'AuthService', 'restaurants',
    function($scope, $state, AuthService, restaurants){
      console.log('restaurantCtrl');

      if (restaurants.length == 1 && !AuthService.isManager()) {
        // there is no choice other than go to the home page of that single restaurant
        return $state.go('home', {restaurantName: restaurants[0].RestaurantName});
      }

      $scope.restaurants = restaurants;
      $scope.currentRestaurant = restaurants.length == 1 ? restaurants[0].RestaurantName : null;

      $scope.status = {
        isopen: false
      };

      $scope.selectRestaurant = function (index) {
        $scope.currentRestaurant = $scope.restaurants[index].RestaurantName;
        $scope.status.isopen = false;
      }

      $scope.getDrowdownText = function () {
        if ($scope.currentRestaurant)
          return $scope.currentRestaurant;
        return '餐厅列表'
      }

      $scope.isManager = function () {
        return AuthService.isManager();
      }

    }
  ])