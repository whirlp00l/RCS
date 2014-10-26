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
    var description = req.body.Description;

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
          Description: description,
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
                Description: description,
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
    var restaurantId = req.body.RestaurantId;
    var adminEmail = req.body.Admin;

    if (!adminEmail) {
      return res.badRequest('Missing required fields: adminEmail')
    }

    Restaurant.findOneById(restaurantId)
      .populate('Manager')
      .populate('Admins')
      .exec(function (err, restaurant){
        if (err) {
          return res.serverError(err);
        }

        if (!restaurant) {
          return res.badRequest('Invalid restaurantId = ' + restaurantId);
        }

        if (restaurant.Manager.Email == adminEmail) {
          return res.badRequest('Cannot assign Manager [' + adminEmail + '] as Admin to Restaurant [' + restaurant.RestaurantName + ']');
        }

        for (var i = restaurant.Admins.length - 1; i >= 0; i--) {
          if (restaurant.Admins[i].Email == adminEmail) {
            return res.badRequest('User [' + adminEmail + '] has already been assigned as Admin to Restaurant [' + restaurant.RestaurantName + ']');
          }
        };

        User.findOneByEmail(adminEmail).exec(function (err, user) {
          if (!user || user.Role != 'admin') {
            return res.badRequest('Invalid adminEmail = ' + adminEmail);
          }

          restaurant.Admins.add(user.id);
          restaurant.save(function (err, restaurant) {
            if (err) {
              return res.serverError(err);
            }

            return res.json({
              Admin: user
            });
          });
        });
      });
  },

  removeAdmin: function (req, res) {
    var currentUser = req.session.user;
    var restaurantId = req.body.RestaurantId;
    var adminEmail = req.body.Admin;

    if (!adminEmail) {
      return res.badRequest('Missing required fields: adminEmail')
    }

    Restaurant.findOneById(restaurantId)
      .populate('Manager')
      .populate('Admins')
      .exec(function (err, restaurant){
        if (err) {
          return res.serverError(err);
        }

        if (!restaurant) {
          return res.badRequest('Invalid restaurantId = ' + restaurantId);
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
          if (!user) {
            return res.badRequest('Invalid adminEmail = ' + adminEmail);
          }

          restaurant.Admins.remove(user.id);
          restaurant.save(function (err, restaurant) {
            if (err) {
              return res.serverError(err);
            }

            return res.json({
              Admins: restaurant.Admins
            });
          });
        });
      });
  },

  listAdmin: function (req, res) {
    var currentUser = req.session.user;
    var restaurantId = req.body.RestaurantId;

    Restaurant.findOneById(restaurantId)
      .populate('Admins')
      .exec(function (err, restaurant){
        if (err) {
          return res.serverError(err);
        }

        if (!restaurant) {
          return res.badRequest('Invalid restaurantId = ' + restaurantId);
        }

        var admins = [];
        for (var i = restaurant.Admins.length - 1; i >= 0; i--) {
          admins.push({
            Email: restaurant.Admins[i].Email,
            Name: restaurant.Admins[i].Name
          });
        };

        return res.json({
          Admins: admins
        });
      });
  },

  list: function (req, res) {
    var currentUser = req.session.user;

    User.findOneById(currentUser.id).populateAll().exec(function (err, user){
      var restaurants = [];

      for (var i = user.ManagedRestaurant.length - 1; i >= 0; i--) {
        restaurants.push({
          id: user.ManagedRestaurant[i].id,
          RestaurantName: user.ManagedRestaurant[i].RestaurantName,
          Description: user.ManagedRestaurant[i].Description,
          Permission: 'manage'
        });
      };

      for (var i = user.AdministeredRestaurant.length - 1; i >= 0; i--) {
        restaurants.push({
          id: user.AdministeredRestaurant[i].id,
          RestaurantName: user.AdministeredRestaurant[i].RestaurantName,
          Description: user.AdministeredRestaurant[i].Description,
          Permission: 'admin'
        });
      };

      return res.json({
        Restaurants: restaurants
      });
    });
  },

  subscribe: function (req, res) {
    if (!req.isSocket) {
      return res.badRequest('request is not from Socket IO.');
    }

    var startTime = new Date();
    sails.log('Restaurant/subscribe: start');

    var currentUser = req.session.user;
    var restaurantId = req.body.RestaurantId;

    Restaurant.findOneById(restaurantId).populate('Menu').populate('Waiters').exec(function (err, restaurant){
      if (err) {
        return res.serverError(err);
      }

      sails.log('Restaurant/subscribe: found restaurant ' + (new Date() - startTime) + 'ms');

      if (!restaurant) {
        return res.badRequest('Invalid restaurantId = ' + restaurantId);
      }

      if (req.session.subscribedRestaurant) {
        // unsubscribe the requesting socket to the 'message' context of other restaurants
        Restaurant.unsubscribe(req, req.session.subscribedRestaurant, ['message']);
        sails.log.debug('Socket client [' + req.socket.id + '] has unsubscribed from Restaurant [' + req.session.subscribedRestaurant.RestaurantName + '].');
        req.session.subscribedRestaurant = null;
      }

      var menuItems = restaurant.Menu;
      var waiters = restaurant.Waiters;
      var flavorRequirements = restaurant.FlavorRequirements;
      // remove unnecessary info before string to req session
      delete restaurant.Menu;
      delete restaurant.Waiters;
      delete restaurant.FlavorRequirements;
      // subscribe the requesting socket to the 'message' context of the restaurant
      Restaurant.subscribe(req, restaurant, ['message']);
      req.session.subscribedRestaurant = restaurant;
      sails.log.debug('Socket client [' + req.socket.id + '] has subscribed to Restaurant [' + restaurant.RestaurantName + '].');

      Table.find({Restaurant: restaurant.id}).populate('Requests').exec(function (err, tables) {
        if (err) {
          return res.serverError(err);
        }

        sails.log('Restaurant/subscribe: found tables ' + (new Date() - startTime) + 'ms');

        var requests = [];
        for (var i = tables.length - 1; i >= 0; i--) {
          var table = tables[i];
          for (var j = table.Requests.length - 1; j >= 0; j--) {
            var request = table.Requests[j];
            requests.push(request.getMessage(table.TableName));
          };
        };

        // send restaurant data to the new subscriber via socket
        var socketId = sails.sockets.id(req.socket);
        sails.sockets.emit(socketId, 'init', {
          table: tables,
          request: requests,
          menuItems: menuItems,
          waiters: waiters,
          flavorRequirements: flavorRequirements
        });

        // notify other subscribers for new comer
        Restaurant.message(restaurant, {
          newSubscriber: currentUser.Email
        }, req);

        sails.log('Restaurant/subscribe: end ' + (new Date() - startTime) + 'ms');
        return res.json({subscribedTo: sails.sockets.socketRooms(req.socket)});
      });
    });
  },

  unsubscribe: function (req, res) {
    if (!req.isSocket) {
      return res.badRequest('request is not from Socket IO.');
    }

    sails.log('Restaurant/unsubscribe');
    var room = null;

    if (req.session.subscribedRestaurant) {
      room = sails.sockets.socketRooms(req.socket);
      // unsubscribe the requesting socket to the 'message' context of other restaurants
      Restaurant.unsubscribe(req, req.session.subscribedRestaurant, ['message']);
      sails.log.debug('Socket client [' + req.socket.id + '] has unsubscribed from Restaurant [' + req.session.subscribedRestaurant.RestaurantName + '].');
      req.session.subscribedRestaurant = null;
    }

    return res.json({unsubscribedTo: room});

  },

  checkMenuVersion: function (req, res) {
    var restaurantId = req.body.RestaurantId;

    Restaurant.findOneById(restaurantId).exec(function (err, restaurant) {
      if (err) {
        return res.serverError(err);
      }

      if (!restaurant) {
        return res.badRequest('RestaurantId [' + restaurantId + '] is invalid');
      }

      return res.json({
        MenuVersion: restaurant.MenuVersion
      });
    })
  },

  listMenu: function (req, res) {
    listMenu(req, res);
  },

  downloadMenu: function (req, res) {
    listMenu(req, res);
  },

  listWaiter: function (req, res) {
    var restaurantId = req.body.RestaurantId;

    Restaurant.findOneById(restaurantId).populate('Waiters').exec(function (err, restaurant) {
      if (err) {
        return res.serverError(err);
      }

      return res.json({
        Waiters: restaurant.Waiters
      });
    });
  },

  updateFlavorRequirements: function (req, res) {
    var restaurantId = req.body.RestaurantId;
    var flavorRequirements = req.body.FlavorRequirements;

    Restaurant.update({id:restaurantId}, {FlavorRequirements:flavorRequirements}).exec(function (err, updated) {
      if (err) {
        return res.serverError(err);
      }

      var updatedFlavorRequirements = updated[0].FlavorRequirements;

      Restaurant.message(restaurantId, {setFlavorRequirements: updatedFlavorRequirements});

      return res.json({
        FlavorRequirements: updatedFlavorRequirements
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

var listMenu = function (req, res) {
  var restaurantId = req.body.RestaurantId;

  Restaurant.findOneById(restaurantId).populate('Menu').exec(function (err, restaurant) {
    if (err) {
      return res.serverError(err);
    }

    return res.json({
      MenuVersion: restaurant.MenuVersion,
      Menu: restaurant.Menu,
      FlavorRequirements: restaurant.FlavorRequirements
    });
  });
}