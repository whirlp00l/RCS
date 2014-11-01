/**
 * MenuItemController
 *
 * @description :: Server-side logic for managing Menuitems
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  deleteAll: function (req, res) {
    MenuItem.destroy({}).exec(function (err) {
      return res.send('All MenuItem deleted');
    });
  },

  create: function (req, res) {
    var name = req.body.Name;
    var type = req.body.Type;
    var price = req.body.Price;
    var premiumPrice = req.body.PremiumPrice;
    var restaurantId = req.body.RestaurantId;
    var alias = req.body.Alias;
    var flavor = req.body.Flavor;

    if (!name || !type || !restaurantId || typeof price == 'undefined') {
      return res.rcsMissingFields(['Name', 'Type', 'Price', 'RestaurantId']);
    }

    MenuItem.findOne({
      Name: name,
      Restaurant: restaurantId
    }).exec(function (err, existingItem) {
      if (err) {
        return res.serverError(err);
      }

      if (existingItem) {
        return res.badRequest('MenuItem name [' + existingItem.Name + '] already exists');
      }

      MenuItem.create({
        Name: name,
        Type: type,
        Price: price,
        PremiumPrice: premiumPrice,
        Alias: alias,
        Flavor: flavor,
        Restaurant: restaurantId,
      }).exec(function (err, menuItem) {
        if (err) {
          return res.serverError(err);
        }

        Restaurant.message(restaurantId, {newMenuItem: menuItem});

        bumpRestaurantMenuVersion(res, restaurantId, function (version) {
          return res.json({
            MenuItem: {
              id: menuItem.id,
              Name: menuItem.Name,
              Type: menuItem.Type,
              Price: menuItem.Price,
              PremiumPrice: menuItem.PremiumPrice,
              Alias: menuItem.Alias,
              Flavor: menuItem.Flavor,
              Restaurant: restaurantId
            },
            Restaurant: {
              MenuVersion: version
            }
          });
        });
      });
    });
  },

  update: function (req, res, next) {
    var restaurantId = req.body.RestaurantId;
    var menuItemId = req.param('id');

    MenuItem.findOne({
      Restaurant: restaurantId,
      id: menuItemId
    }).exec(function (err, menuItem) {
      if (err) {
        return res.serverError(err);
      }

      if (!menuItem) {
        return res.badRequest('MenuItem id [' + menuItemId + '] is invalid');
      }

      var type = req.body.Type;
      var price = req.body.Price;
      var premiumPrice = req.body.PremiumPrice;
      var alias = req.body.Alias;
      var flavor = req.body.Flavor;
      var isRecommended = req.body.IsRecommended;

      if (typeof type != 'undefined') {
        menuItem.Type = type;
      }

      if (typeof price != 'undefined') {
        menuItem.Price = price;
      }

      if (typeof premiumPrice != 'undefined') {
        menuItem.PremiumPrice = premiumPrice;
      }

      if (typeof alias != 'undefined') {
        menuItem.Alias = alias;
      }

      if (typeof flavor != 'undefined') {
        menuItem.Flavor = flavor;
      }

      if (typeof isRecommended != 'undefined') {
        menuItem.IsRecommended = isRecommended;
      }

      menuItem.save(function (err, menuItem) {
        if (err) {
          return res.serverError(err);
        }

        menuItem.Restaurant = restaurantId;
        Restaurant.message(restaurantId, {setMenuItem: menuItem});

        bumpRestaurantMenuVersion(res, restaurantId, function (version) {
          return res.json({
            MenuItem: menuItem,
            Restaurant: {
              MenuVersion: version
            }
          });
        });
      });
    });
  },

  delete: function (req, res) {
    var restaurantId = req.body.RestaurantId;
    var menuItemId = req.param('id');

    MenuItem.findOne({
      Restaurant: restaurantId,
      id: menuItemId
    }).exec(function (err, menuItem) {
      if (err) {
        return res.serverError(err);
      }

      if (!menuItem) {
        return res.badRequest('MenuItem id [' + menuItemId + '] is invalid');
      }

      menuItem.destroy(function (err) {
        if (err) {
          return res.serverError(err);
        }

        Restaurant.message(restaurantId, {removeMenuItemId: menuItem.id});

        bumpRestaurantMenuVersion(res, restaurantId, function (version) {
          return res.json({
            MenuItem: {
              id: menuItem.id
            },
            Restaurant: {
              MenuVersion: version
            }
          });
        });
      })
    });
  }

  // create: function (argument) {
  //   var restaurantName = req.body.RestaurantName;
  //   var menuItems = req.body.Menu;

  //   if (!restaurantName) {
  //     return res.badRequest('Missing required fields.');
  //   }

  //   if (!menuItems || menuItems.length == 0) {
  //     return res.badRequest('Missing required fields.');
  //   }

  //   // var menuItemIds = [];
  //   var countUpdate = 0;
  //   var countNew = 0;

  //   Restaurant.findOneByRestaurantName(restaurantName).populate('Menu').exec(function (err, restaurant) {

  //     for (var i = menuItems.length - 1; i >= 0; i--) {
  //       Menuitem.create({
  //         Name: menuItems[i].Name,
  //         Price: menuItems[i].Price,
  //         PremiumPrice: menuItems[i].PremiumPrice,
  //         Restaurant: restaurant.id
  //       }).exec(function (err, menuItem) {
  //         if (countUpdate + countNew == menuItems.length) {
  //           return res.json({
  //             updateCount: ,
  //             newCount:
  //           })
  //         }
  //         // menuItemIds.push(menuItem.id)

  //       });
  //     }); // end for loop
  //   }); // end Restaurant.findOneByRestaurantName

  // }
};

var bumpRestaurantMenuVersion = function (res, restaurantId, cb) {
  Restaurant.findOneById(restaurantId).exec(function (err, restaurant) {
    if (err) {
      return res.serverError(err);
    }

    if (!restaurant) {
      return res.badRequest('RestaurantId [' + restaurantId + '] is invalid');
    }

    if (!restaurant.MenuVersion) {
      restaurant.MenuVersion = 1;
    } else {
      restaurant.MenuVersion = parseInt(restaurant.MenuVersion) + 1;
    }

    restaurant.save(function (err, restaurant) {
      if (err) {
        return res.serverError(err);
      }

      return cb(restaurant.MenuVersion);
    });
  });

}