/**
 * RestaurantController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  create: function(req, res){
    var currentUser = req.session.user;
    var restaurantName = req.body.RestaurantName;

    if (!currentUser || !restaurantName) {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOneByRestaurantName(restaurantName).done(function (err, restaurant){
      if (err) {
        return res.serverError(err);
      }

      if (typeof restaurant != 'undefined') {
        return res.badRequest('Restaurant name [' + restaurantName + '] has already been used.');
      }
      
      var admins = [currentUser];

      Restaurant.create({
        RestaurantName: restaurantName,
        Manager: currentUser,
        Admins: admins
      }).done(function (err, restaurant){
        if (err) {
          return res.serverError(err);
        }

        return res.json(restaurant);
      });
    });
  },

  addAdmin: function (req, res) {
    var currentUser = req.session.user;
    var restaurantName = req.body.RestaurantName;
    var admin = req.body.Admin;

    if (!currentUser || !restaurantName || !admin) {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOne({
      RestaurantName:restaurantName,
      Manager:currentUser
    }).done(function (err, restaurant){
      if (err) {
        return res.serverError(err);
      }

      if (typeof restaurant == 'undefined') {
        return res.badRequest('Restaurant named [' + restaurantName + '] does not exist.');
      }

      console.log(restaurant.Admins);
      console.log(restaurant.Admins.indexOf(admin));

      if (restaurant.Admins.indexOf(admin) != -1) {
        return res.badRequest('User [' + admin + '] has already been assigned as Admin to Restaurant [' + restaurantName + ']');
      }

      User.findOneByEmail(admin).done(function (err, user) {
        if (typeof user == 'undefined') {
          return res.badRequest('User [' + admin + '] does not exist');
        }

        restaurant.Admins.push(admin);
        restaurant.save(function (err, restaurant) {
          if (err) {
            return res.serverError(err);
          }

          return res.json(restaurant);
        })
      })
    });
  },
  
  list: function (req, res) {
    var currentUser = req.session.user;

    if (!currentUser) {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.find().done(function (err, restaurants){
      if (err) {
        return res.serverError(err);
      }

      var adminRestaurants = [];

      for (var i = restaurants.length - 1; i >= 0; i--) {
        if (restaurants[i].Admins.indexOf(currentUser) != -1) {
          adminRestaurants.push(restaurants[i]);
        }
      };

      return res.json(adminRestaurants);
    });
  },

  deleteAll: function (req, res, next) {
    Restaurant.find().done(function (err, restaurants) {
      if (restaurants.length == 0) {
        res.send("No Restaurant");
      }
      for (var i = 0 ;i < restaurants.length; i++) {
        restaurants[i].destroy(function() {
          console.log("deleted Restaurant " + restaurants[i].RestaurantName)
          if (i == restaurants.length - 1) {
            res.send("Restaurant all deleted");
          }
        });
      }
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to RestaurantController)
   */
  _config: {}

  
};
