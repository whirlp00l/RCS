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

var hasPermission = function (restaurant, currentUser) {
  sails.log.debug('If user ' + currentUser.Email + ' has permission to ' + restaurant.RestaurantName);

  if (restaurant.Manager.id == currentUser.id) {
    return true;
  }

  var isAdmin = false;
  for (var i = restaurant.Admins.length - 1; i >= 0; i--) {
    if (restaurant.Admins[i].id == currentUser.id) {
      isAdmin = true;
      break;
    }
  }

  sails.log.debug(isAdmin ? 'has permission' : 'no permission');
  return isAdmin;
}

module.exports = {

  create: function(req, res){
    var currentUser = req.session.user;
    var restaurantName = req.body.RestaurantName;

    sails.log.debug('Restaurant/create');

    if (!currentUser.Email || !restaurantName) {
      return res.badRequest('Missing required fields.')
    }

    var adminEmails = req.body.Admins;

    Restaurant.findOneByRestaurantName(restaurantName).exec(function (err, restaurant){
      if (err) {
        return res.serverError(err);
      }

      if (typeof restaurant != 'undefined') {
        return res.badRequest('Restaurant name [' + restaurantName + '] has already been used.');
      }

      // search for users in admin list
      var managerUserId = currentUser.id;
      var adminUserIds = [];

      if (!adminEmails || adminEmails.length == 0) {
        Restaurant.create({
          RestaurantName: restaurantName,
          Manager: managerUserId
        }).exec(function (err, restaurant){
          if (err) {
            return res.serverError(err);
          }

          sails.log.debug('Restaurant created. No admin list.')
          return res.json(restaurant);
        });
      } else {
        adminEmails.forEach(function (adminEmail) {
          sails.log.debug('search for user ' + adminEmail);

          User.findOneByEmail(adminEmail).exec(function (err, user) {
            if (err) {
              return res.serverError(err);
            }

            if (typeof user == 'undefined') {
              return res.badRequest('User [' + adminEmail + '] does not exist');
            }

            adminUserIds.push(user.id);
            sails.log.debug('Add adminUserId = ' + user.id);

            if (adminUserIds.length == adminEmails.length && managerUserId) {
              sails.log.debug('Ready to create restaurant...')
              Restaurant.create({
                RestaurantName: restaurantName,
                Manager: managerUserId
              }).exec(function (err, restaurant){
                if (err) {
                  return res.serverError(err);
                }

                for (var i = adminUserIds.length - 1; i >= 0; i--) {
                  restaurant.Admins.add(adminUserIds[i]);
                };

                sails.log.debug('Restaurant created. Updating admin list...')
                restaurant.save(function (err, restaurant) {
                  if (err) {
                    restaurant.destroy();
                    return res.serverError(err);
                  }

                  sails.log.debug('Admin list updated.')
                  return res.json(restaurant);
                });
              });
            }
          });
        });
      }
    });
  },

  addAdmin: function (req, res) {
    var currentUser = req.session.user;
    var restaurantName = req.body.RestaurantName;
    var adminEmail = req.body.Admin;

    if (!currentUser || !restaurantName || !adminEmail) {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOneByRestaurantName(restaurantName)
      .populate('Manager')
      .populate('Admins')
      .exec(function (err, restaurant){
        if (err) {
          return res.serverError(err);
        }

        if (typeof restaurant == 'undefined' || restaurant.Manager.id != currentUser.id) {
          return res.badRequest('Restaurant named [' + restaurantName + '] is invalid.');
        }

        if (restaurant.Manager.Email == adminEmail) {
          return res.badRequest('Cannot assign Manager [' + adminEmail + '] as Admin to Restaurant [' + restaurantName + ']');
        }

        for (var i = restaurant.Admins.length - 1; i >= 0; i--) {
          if (restaurant.Admins[i].Email == adminEmail) {
            return res.badRequest('User [' + adminEmail + '] has already been assigned as Admin to Restaurant [' + restaurantName + ']');
          }
        };

        User.findOneByEmail(adminEmail).exec(function (err, user) {
          if (typeof user == 'undefined') {
            return res.badRequest('User [' + adminEmail + '] is invalid');
          }

          restaurant.Admins.add(user.id);
          restaurant.save(function (err, restaurant) {
            if (err) {
              return res.serverError(err);
            }

            return res.json(restaurant);
          });
        });
      });
  },

  removeAdmin: function (req, res) {
    var currentUser = req.session.user;
    var restaurantName = req.body.RestaurantName;
    var adminEmail = req.body.Admin;

    if (!currentUser || !restaurantName || !adminEmail) {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOneByRestaurantName(restaurantName)
      .populate('Manager')
      .populate('Admins')
      .exec(function (err, restaurant){
        if (err) {
          return res.serverError(err);
        }

        if (typeof restaurant == 'undefined' || restaurant.Manager.id != currentUser.id) {
          return res.badRequest('Restaurant named [' + restaurantName + '] is invalid.');
        }

        var foundAdmin = false;
        for (var i = restaurant.Admins.length - 1; i >= 0; i--) {
          if (restaurant.Admins[i].Email == adminEmail) {
            foundAdmin = true;
            break;
          }
        };

        if (!foundAdmin) {
          return res.badRequest('User [' + adminEmail + '] is not admin of Restaurant [' + restaurantName + ']');
        }

        User.findOneByEmail(adminEmail).exec(function (err, user) {
          if (typeof user == 'undefined') {
            return res.badRequest('User [' + adminEmail + '] is invalid');
          }

          restaurant.Admins.remove(user.id);
          restaurant.save(function (err, restaurant) {
            if (err) {
              return res.serverError(err);
            }

            return res.json(restaurant);
          });
        });
      });
  },

  listAdmin: function (req, res) {
    var currentUser = req.session.user;
    var restaurantName = req.body.RestaurantName;

    if (!currentUser || !restaurantName) {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOneByRestaurantName(restaurantName)
      .populate('Manager')
      .populate('Admins')
      .exec(function (err, restaurant){
        if (err) {
          return res.serverError(err);
        }

        if (typeof restaurant == 'undefined' || restaurant.Manager.id != currentUser.id) {
          return res.badRequest('Restaurant named [' + restaurantName + '] is invalid.');
        }

        var admins = []
        for (var i = restaurant.Admins.length - 1; i >= 0; i--) {
          admins.push(restaurant.Admins[i].Email);
        };

        return res.json(admins);
      });
  },

  list: function (req, res) {
    var currentUser = req.session.user;

    if (!currentUser) {
      return res.badRequest('Missing required fields.')
    }

    User.findOneById(currentUser.id).populateAll().exec(function (err, user){
      var restaurants = [];

      for (var i = user.ManagedRestaurant.length - 1; i >= 0; i--) {
        restaurants.push({
          RestaurantName: user.ManagedRestaurant[i].RestaurantName,
          Permission: 'manage'
        });
      };

      for (var i = user.AdministeredRestaurant.length - 1; i >= 0; i--) {
        restaurants.push({
          RestaurantName: user.AdministeredRestaurant[i].RestaurantName,
          Permission: 'admin'
        });
      };

      return res.json(restaurants);
    });
  },

  subscribe: function (req, res) {
    if (!req.isSocket) {
      return res.badRequest('request is not from Socket IO.');
    }

    var currentUser = req.session.user;
    var restaurantName = req.body.RestaurantName;

    Restaurant.findOneByRestaurantName(restaurantName).populateAll().exec(function (err, restaurant){
      if (err) {
        return res.serverError(err);
      }

      if (!restaurant || !hasPermission(restaurant, currentUser)) {
        return res.badRequest('Restaurant named [' + restaurantName + '] is invalid.');
      }

      if (req.session.subscribedRestaurant) {
        // unsubscribe the requesting socket to the 'message' context of other restaurants
        Restaurant.unsubscribe(req, req.session.subscribedRestaurant, ['message']);
        sails.log.debug('Socket client [' + req.socket.id + '] has unsubscribed from Restaurant [' + req.session.subscribedRestaurant.RestaurantName + '].');
      }

      // subscribe the requesting socket to the 'message' context of the restaurant
      Restaurant.subscribe(req, restaurant, ['message']);
      req.session.subscribedRestaurant = restaurant;
      sails.log.debug('Socket client [' + req.socket.id + '] has subscribed to Restaurant [' + restaurant.RestaurantName + '].');

      Request.find({Restaurant: restaurant.id}).populate('Table').exec(function (err, requests) {
        if (err) {
          return res.serverError(err);
        }

        Table.find({Restaurant: restaurant.id}).populate('Requests').exec(function (err, tables) {
          if (err) {
            return res.serverError(err);
          }

          // send restaurant data to the new subscriber via socket
          var socketId = sails.sockets.id(req.socket);
          sails.sockets.emit(socketId, 'init', {
            table: tables,
            request: requests
          });

          // notify other subscribers for new comer
          Restaurant.message(restaurant, {
            newSubscriber: currentUser.Email
          }, req);

          return res.json({subscribedTo: sails.sockets.socketRooms(req.socket)});
        });
      });

    });
  },

  deleteAll: function (req, res, next) {
    Restaurant.destroy({}).exec(function (err) {
      return res.send('All restaurants deleted.');
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to RestaurantController)
   */
  _config: {}


};
