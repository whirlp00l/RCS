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
      var itemId = orderItems[i];

      if (tempOrderGroup[itemId]) {
        tempOrderGroup[itemId].count++;
      } else {
        for (var j = menuItems.length - 1; j >= 0; j--) {
          if (menuItems[j].id == itemId) {
            var itemName = menuItems[j].Name;
            var itemType = menuItems[j].Type;
            var itemPrice = menuItems[j].Price;
            var itemPremiumPrice = menuItems[j].PremiumPrice;
            break;
          }
        }

        tempOrderGroup[itemId] = {
          name: itemName,
          type: itemType,
          price: itemPrice,
          premiumPrice: itemPremiumPrice,
          count: 1
        };
      }
    }

    var orderGroup = [];
    for (var i = tempOrderGroup.length - 1; i >= 0; i--) {
      if (angular.isDefined(tempOrderGroup[i])) {
        orderGroup.push(tempOrderGroup[i]);
      }
    }

    return orderGroup;
  }
}