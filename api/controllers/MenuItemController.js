/**
 * MenuItemController
 *
 * @description :: Server-side logic for managing Menuitems
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  create: function (req, res) {
    var name = req.body.Name;
    var price = req.body.Price;
    var premiumPrice = req.body.PremiumPrice;
    var restaurantId = req.body.RestaurantId;

    if (!name || !restaurantId || typeof price == 'undefined') {
      return res.badRequest('Missing required fields.');
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
        Price: price,
        PremiumPrice: premiumPrice,
        Restaurant: restaurantId
      }).exec(function (err, menuItem) {
        if (err) {
          return res.serverError(err);
        }

        bumpRestaurantMenuVersion(res, restaurantId, function (version) {
          return res.json({
            MenuItem: {
              id: menuItem.id,
              Name: menuItem.Name,
              Price: menuItem.Price,
              PremiumPrice: menuItem.PremiumPrice
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

      var name = req.body.Name;
      var price = req.body.Price;
      var premiumPrice = req.body.PremiumPrice;

      if (typeof name != 'undefined') {
        menuItem.Name = name;
      }

      if (typeof price != 'undefined') {
        menuItem.Price = price;
      }

      if (typeof premiumPrice != 'undefined') {
        menuItem.PremiumPrice = premiumPrice;
      }

      menuItem.save(function (err, menuItem) {
        if (err) {
          return res.serverError(err);
        }

        bumpRestaurantMenuVersion(res, restaurantId, function (version) {
          return res.json({
            MenuItem: {
              id: menuItem.id,
              Name: menuItem.Name,
              Price: menuItem.Price,
              PremiumPrice: menuItem.PremiumPrice
            },
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