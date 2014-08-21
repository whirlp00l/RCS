angular
  .module('rcs')
  .controller('menuCtrl', ['$scope', '$state', '$stateParams', '$modal', '$timeout', 'rcsAPI', 'rcsData', 'TEXT', 'menu',
    function($scope, $state, $stateParams, $modal, $timeout, rcsAPI, rcsData, TEXT, menu){

      if (!rcsData.getRestaurantId()) {
        return $state.go('restaurant');
      }

      $scope.restaurantId = rcsData.getRestaurantId();
      $scope.restaurantName = rcsData.getRestaurantName();
      $scope.menuItems = menu;
      $scope.menuTypes = [];
      $scope.master = {
        menuItems: []
      };
      for (var i = 0 ; i < menu.length; i++) {
        var type = menu[i].Type;
        if ($scope.menuTypes.indexOf(type) == -1) {
          $scope.menuTypes.push(type);
        }

        $scope.master.menuItems.push(angular.copy(menu[i]))
      }

      $scope.selectedIndex = 0;
      $scope.newMenuItem = {
        Name: '',
        Type: $scope.menuTypes[$scope.selectedIndex],
        Price: '',
        PremiumPrice: ''
      }
      $scope.newType = '';

      $scope.isValidNewType = function () {
        if ($scope.newType == '') {
          return false;
        }

        var i = $scope.menuTypes.indexOf($scope.newType);
        if (i != -1) {
          $scope.selectedIndex = i;
          return false;
        }

        return true;
      }

      $scope.onTabSelected = function () {
        $scope.selectedIndex = this.$index;
        for (var i = $scope.menuItems.length - 1; i >= 0; i--) {
          $scope.menuItems[i] = angular.copy($scope.master.menuItems[i]);
        };
        $scope.newMenuItem.Type = $scope.menuTypes[$scope.selectedIndex];
      }

      $scope.createNewType = function () {
        if (!$scope.isValidNewType()) {
          return;
        }

        $scope.menuTypes.push($scope.newType);
        $scope.newType = '';
        $timeout(function () {
          $scope.selectedIndex = $scope.menuTypes.length - 1;
        })
        // $scope.resetNew();
      }

      $scope.isDirty = function (menuItem) {
        var i = $scope.menuItems.indexOf(menuItem);
        return !angular.equals(menuItem, $scope.master.menuItems[i]);
      }

      $scope.discardChange = function (menuItem) {
        var i = $scope.menuItems.indexOf(menuItem);
        $scope.menuItems[i] = angular.copy($scope.master.menuItems[i]);
      }

      $scope.update = function (menuItem) {
        var i = $scope.menuItems.indexOf(menuItem);
        rcsAPI.MenuItem.update(
          $scope.restaurantId,
          menuItem.id,
          menuItem.Type,
          menuItem.Price,
          menuItem.PremiumPrice == '' ? null : menuItem.PremiumPrice
        )
        .success(function(data) {
          var updatedMenuItem = data.MenuItem;
          $scope.menuItems[i] = updatedMenuItem;
          $scope.master.menuItems[i] = angular.copy(updatedMenuItem);
        })
        .error(function (data, status) {
          if (status === 400) {
            alert(data.validationErrors || 400);
          } else {
            alert(status);
          }
        });
      }

      $scope.delete = function (menuItem) {
        var i = $scope.menuItems.indexOf(menuItem);

        var modalInstance = $modal.open({
          templateUrl: '/template/modalDelete',
          controller: 'modalDeleteCtrl',
          size: 'sm',
          resolve: {
            title: function () {
              return TEXT.removeMenuItem.title + menuItem.Name;
            },
            content: function() {
              return TEXT.removeMenuItem.content;
            }
          }
        });

        modalInstance.result.then(function () {
          rcsAPI.MenuItem.delete(
            $scope.restaurantId,
            menuItem.id
          )
          .success(function(data) {
            var newMenuItem = data.MenuItem;
            $scope.menuItems.splice(i, 1);
            $scope.master.menuItems.splice(i, 1);
          })
          .error(function (data, status) {
            if (status === 400) {
              alert(data.validationErrors || 400);
            } else {
              alert(status);
            }
          });
        });
      }

      $scope.createNew = function () {
        if (!$scope.newMenuItem || !$scope.newMenuItem.Name
          || !$scope.newMenuItem.Type || !$scope.newMenuItem.Price) {
          return;
        }

        rcsAPI.MenuItem.create(
          $scope.restaurantId,
          $scope.newMenuItem.Name,
          $scope.newMenuItem.Type,
          $scope.newMenuItem.Price,
          $scope.newMenuItem.PremiumPrice == '' ? null : $scope.newMenuItem.PremiumPrice
        )
        .success(function(data) {
          var newMenuItem = data.MenuItem;
          $scope.menuItems.push(newMenuItem);
          $scope.master.menuItems.push(angular.copy(newMenuItem));
          $scope.resetNew();
        })
        .error(function (data, status) {
          if (status === 400) {
            alert(data.validationErrors || 400);
          } else {
            alert(status);
          }
        });
      }

      $scope.resetNew = function () {
        $scope.newMenuItem = {
          Name: '',
          Type: $scope.menuTypes[$scope.selectedIndex],
          Price: '',
          PremiumPrice: ''
        }
      }
    }]);