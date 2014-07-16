angular
  .module('rcs')
  .controller('restaurantCtrl', ['$scope', '$state', 'restaurants',
    function($scope, $state, restaurants){
      console.log('restaurantCtrl');

      // if (restaurants.length == 1) {
      //   $state.go('home', {restaurantName: restaurants[0].RestaurantName});
      //   return;
      // }

      $scope.restaurants = restaurants;
      $scope.currentRestaurant = restaurants.length == 1 ? restaurants[0].RestaurantName : null;

      $scope.status = {
        isopen: false
      };

      $scope.selectRestaurant = function (index) {
        $scope.currentRestaurant = $scope.restaurants[index].RestaurantName;
        $scope.status.isopen = false;
      }

      $scope.getCurrentRestaurant = function () {
        if ($scope.currentRestaurant)
          return $scope.currentRestaurant;
        return '餐厅列表'
      }

    }
  ])