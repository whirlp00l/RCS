angular
  .module('rcs')
  .controller('restaurantCtrl', ['$scope', '$state', 'rcsData', 'rcsAuth', 'restaurants',
    function($scope, $state, rcsData, rcsAuth, restaurants){

      if (restaurants.length == 1 && !rcsAuth.isManager()) {
        // there is no choice other than go to the home page of that single restaurant
        rcsData.setRestaurant(restaurants[0]);
        return $state.go('home', {restaurantId: restaurants[0].id});
      }

      $scope.restaurants = [];
      $scope.restaurants = $scope.restaurants.concat(restaurants);
      // $scope.RestaurantName = restaurants.length == 1 ? restaurants[0].RestaurantName : null;

      $scope.status = {
        isopen: false
      };

      $scope.selectRestaurant = function (index) {
        // $scope.RestaurantName = $scope.restaurants[index].RestaurantName;
        // $scope.status.isopen = false;
        rcsData.setRestaurant($scope.restaurants[index]);
      }

      // $scope.getDrowdownText = function () {
      //   if ($scope.RestaurantName)
      //     return $scope.RestaurantName;

      //   if ($scope.restaurants.length == 0)
      //     return '无餐厅';

      //   return '{0} (共{1}家)'.format('餐厅列表', $scope.restaurants.length);
      // }

      $scope.isManager = function () {
        return rcsAuth.isManager();
      }

      $scope.canManage = function (restaurant) {
        return restaurant.Permission == 'manage';
      }

    }
  ])