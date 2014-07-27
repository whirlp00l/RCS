angular
  .module('rcs')
  .controller('restaurantCtrl', ['$scope', '$state', 'AuthService', 'restaurants',
    function($scope, $state, AuthService, restaurants){

      if (restaurants.length == 1 && !AuthService.isManager()) {
        // there is no choice other than go to the home page of that single restaurant
        return $state.go('home', {restaurantName: restaurants[0].RestaurantName});
      }

      $scope.restaurants = [];
      $scope.restaurants = $scope.restaurants.concat(restaurants);
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

        if ($scope.restaurants.length == 0)
          return '无餐厅';

        return '{0} (共{1}家)'.format('餐厅列表', $scope.restaurants.length);
      }

      $scope.isManager = function () {
        return AuthService.isManager();
      }

    }
  ])