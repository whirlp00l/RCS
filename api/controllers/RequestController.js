/**
 * RequestController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
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
var isSubscriber = function (restaurantId, req) {
  sails.log.debug('If request client has subscribed to ' + restaurantId);
  sails.log.debug('req.session.subscribedRestaurant.id = ' + req.session.subscribedRestaurant.id);

  var has = false;
  if (req.session.subscribedRestaurant && req.session.subscribedRestaurant.id == restaurantId) {
    has = true;
  }

  sails.log.debug(has ? 'has subscribed' : 'not subscribed');
  return has;
}

module.exports = {
  deleteAll: function (req, res) {
    Request.destroy({}).exec(function (err) {
      return res.send('All requests deleted');
    });
  },

  list: function (req, res) {
    var restaurantId = req.body.RestaurantId;

    Request.find({Restaurant: restaurantId}).exec(function (err, requests) {
      if (err) {
        return res.serverError(err);
      }

      return res.json({
        RestaurantId: restaurantId,
        Requests: requests
      });
    });
  },

  create: function (req, res) {
    var tableId = req.body.TableId;
    var type = req.body.Type;

    if (!tableId || !type ) {
      return res.badRequest('Missing required fields.')
    }

    var payType = req.body.PayType;
    var payAmount = req.body.PayAmount;

    Table.findOneById(tableId).populate('Requests').exec(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      if (!table) {
        return res.badRequest('Not exist: Table id = ' + tableId);
      }

      var isDupRequest = false;
      var dupRequest = null;
      for (var i = table.Requests.length - 1; i >= 0; i--) {
        dupRequest = table.Requests[i];
        if (dupRequest.Status != "closed" && dupRequest.Type == type) {
          isDupRequest = true;
          break;
        }
      };

      if (!isDupRequest) {
        // create new request
        Request.create({
          Table: table.id,
          Restaurant: table.Restaurant,
          Type: type,
          PayType: payType,
          PayAmount: payAmount
        }).exec(function (err, request) {
          table.Requests.add(request.id);
          if (request.Type == 'pay') {
            table.Status = 'paying';
            table.StatusUpdateAt = new Date();
          }

          table.save(function (err, table) {
            if (err) {
              return res.serverError(err);
            }

            Request.findOneById(request.id).populate('Table').exec(function (err, request) {
              if (err) {
                return res.serverError(err);
              }

              // publish a message to the restaurant.
              // every client subscribed to the restaurant will get it.
              Restaurant.message(table.Restaurant, {
                newRequest: request,
                setTable: table
              });

              return res.json(request);
            });
          });
        });
      } else {
        // increase the priority
        Request.update(dupRequest.id, {
          Importance: parseInt(dupRequest.Importance) + 1
        }).exec(function (err, request) {
          if (err) {
            return res.serverError(err);
          }

          Request.findOneById(dupRequest.id).populate('Table').exec(function (err, request) {
            if (err) {
              return res.serverError(err);
            }

            // publish a message to the restaurant.
            // every client subscribed to the restaurant will get it.
            Restaurant.message(table.Restaurant, {setRequest: request});

            return res.json(request);
          });
        });
      }
    });
  },

  start: function (req, res) {
    var requestId = req.param('id');

    Request.findOneById(requestId).populate('Table').exec(function (err, request) {
      if (err) {
        return res.serverError(err);
      }

      if (!request || !request.Restaurant || !isSubscriber(request.Restaurant, req)) {
        return res.badRequest('Request [' + requestId + '] is invalid.');
      }

      request.Status = 'inProgress';

      request.save(function (err) {
        if (err) {
          return res.serverError(err);
        }

        Restaurant.message(request.Restaurant, {
          setRequest: request
        });

        return res.json(request);
      });
    });
  },

  close: function (req, res) {
    var requestId = req.param('id');

    Request.findOneById(requestId).exec(function (err, request) {
      if (err) {
        return res.serverError(err);
      }

      if (!request || !request.Restaurant || !isSubscriber(request.Restaurant, req)) {
        return res.badRequest('Request [' + requestId + '] is invalid.');
      }

      request.Status = 'closed';
      request.ClosedAt = new Date();

      request.save(function (err) {
        if (err) {
          return res.serverError(err);
        }

        Table.findOneById(request.Table).populate('Requests').exec(function (err, table) {

          if (request.Type == 'pay') {
            table.Status = 'paid';
            table.StatusUpdateAt = new Date();
          }

          table.save(function (err) {
            if (err) {
              return res.serverError(err);
            }

            Restaurant.message(table.Restaurant, {
              setRequest: request,
              setTable: table
            });

            return res.json(request);
          })
        })
      });
    })
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to RequestController)
   */
  _config: {}


};
