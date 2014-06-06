// angular
//   .module('rcs')
//   .controller('listRestaurantsCtrl', ['$scope', '$http', 'restaurants', 'Fullscreen', function($scope, $http, restaurants, Fullscreen){
//     $scope.restaurants = restaurants;
//     $scope.deleteRestaurant = function(restaurantName) {
//     	$http.delete('/api/deleteRestaurant/' + restaurantName).then(function() {
//             $http.get('/api/listRestaurants').then(function(res) {
//             	$scope.restaurants = res.data;
//             })
//         })
//     };
//     $scope.checkFullscreen = function () {
//       if (Fullscreen.isEnabled()) $scope.isFullscreen = true;
//       else $scope.isFullscreen = false; 
//     };
//     $scope.goFullscreen = function () {
//         Fullscreen.all();
//     };
//   }])