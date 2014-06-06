// angular
//   .module('rcs')
//   .controller('newRestaurantCtrl', ['$scope', '$http', function($scope, $http){
//   	$scope.createRestaurant = function () {
//   		var name = $scope.restaurantName;
//   		if(name == undefined)
//   		{
//   			return;
//   		}

//   		$http
//   			.post('/api/createRestaurant', {Name: name})
//   			.error(function(data, status) {
//   				alert(data.error);
//   			})
//   			.success(function() {
//   				alert('Successfully created ' + name);  				
//   				$scope.restaurantName = '';
//   			});
//   	};
//   }])