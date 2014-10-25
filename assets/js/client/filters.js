angular
  .module('rcs')
  .filter('makeOrderGroup', makeOrderGroup);

function makeOrderGroup () {
  return function (orderItems, menuItems) {
    if (!orderItems) {
      return [];
    }

    if (!menuItems) {
      return orderItems;
    }

    var tempOrderGroup = [];

    for (var i = orderItems.length - 1; i >= 0; i--) {
      var itemId = orderItems[i]; // in format list 28.4, 17.1, 36

      if (tempOrderGroup[itemId]) {
        tempOrderGroup[itemId].count++;
      } else {
        var menuItemId = parseInt(Math.floor(itemId)); // --> 28, 17, 36
        var flavorId = parseInt(Math.floor(itemId*10 - menuItemId*10)) // --> 4, 1, 0. *10 to handle 28.48 case

        for (var j = menuItems.length - 1; j >= 0; j--) {
          if (menuItems[j].id == menuItemId) {
            var menuItem = menuItems[j];
            var flavor = undefined;

            if (flavorId > 0) {
              if (menuItem.Flavor && angular.isArray(menuItem.Flavor) && menuItem.Flavor.length >= flavorId) {
                flavor = menuItem.Flavor[flavorId - 1];
              } else {
                itemId = menuItemId;
              }
            }

            tempOrderGroup[itemId] = {
              name: menuItem.Name,
              type: menuItem.Type,
              price: menuItem.Price,
              premiumPrice: menuItem.PremiumPrice,
              alias: menuItem.Alias,
              flavor: flavor,
              count: 1
            };
            break;
          }
        }
      }
    }

    var orderGroup = [];
    for (groupIndex in tempOrderGroup) {
      if (angular.isDefined(tempOrderGroup[groupIndex])) {
        orderGroup.push(tempOrderGroup[groupIndex]);
      }
    }

    return orderGroup;
  }
}