angular
  .module('rcs')
  .controller('adminCtrl', ['$scope', '$state', '$stateParams', '$modal', 'admins', 'rcsAPI', 'rcsData', 'TEXT',
    function($scope, $state, $stateParams, $modal, admins, rcsAPI, rcsData, TEXT){

      if (!rcsData.getRestaurantId()) {
        return $state.go('restaurant');
      }

      $scope.restaurantId = rcsData.getRestaurantId();
      $scope.restaurantName = rcsData.getRestaurantName();
      $scope.admins = admins;

      $scope.done = function () {
        var toState = 'home';
        if ($state.previous) {
          toState = $state.previous.name
        }
        $state.go(toState);
      }

      $scope.addAdmin = function (newAdmin) {
        rcsAPI.Restaurant.addAdmin($scope.restaurantId, newAdmin)
          .success(function () {
            admins.push(newAdmin);
          })
      }

      $scope.removeAdmin = function (admin) {
        var modalInstance = $modal.open({
          templateUrl: '/template/modalDelete',
          controller: 'modalDeleteCtrl',
          size: 'sm',
          resolve: {
            title: function () {
              return TEXT.removeAdmin.title + admin;
            },
            content: function() {
              return TEXT.removeAdmin.content;
            }
          }
        });

        modalInstance.result.then(function () {
          rcsAPI.Restaurant.removeAdmin($scope.restaurantId, admin)
            .success(function () {
              admins.splice(admins.indexOf(admin), 1);
            })
        });
      }
    }
  ])
