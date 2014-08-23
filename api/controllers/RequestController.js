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
    var restaurantId = req.body.RestaurantId;
    var type = req.body.Type;

    if (!type) {
      return res.badRequest('Missing required field: type')
    }

    Table.findOneById(tableId).populate('Requests').exec(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      if (!table) {
        return res.badRequest('Invalid tableid = ' + tableId);
      }

      var hasDupRequest = false;
      var dupRequest = null;
      for (var i = table.Requests.length - 1; i >= 0; i--) {
        dupRequest = table.Requests[i];
        if (dupRequest.Status != "closed" && dupRequest.Type == type) {
          hasDupRequest = true;
          break;
        }
      };

      if (!hasDupRequest) {
        // create new request
        switch (type) {
          case 'order':
            return createOrder(req, res, table, restaurantId, type);
          case 'pay':
            return createPay(req, res, table, restaurantId, type);
          default:
            var request = {
              Table: table.id,
              Restaurant: restaurantId,
              Type: type
            };

            return createRequest(res, request, table);
        }
      } else {
        // increase the importance
        return bumpImportance(res, dupRequest, table, restaurantId);
      }
    });
  },

  start: function (req, res) {
    var requestId = req.param('id');

    Request.findOneById(requestId).populate('Table').exec(function (err, request) {
      if (err) {
        return res.serverError(err);
      }

      if (!request) {
        return res.badRequest('Invalid requestId = ' + requestId);
      }

      request.Status = 'inProgress';

      request.save(function (err) {
        if (err) {
          return res.serverError(err);
        }

        var message = {
          setRequest: request.getMessage(request.Table.TableName)
        };

        // publish a message to the restaurant.
        // every client subscribed to the restaurant will get it.
        Restaurant.message(request.Restaurant, message);
        return res.json(message);
      });
    });
  },

  close: function (req, res) {
    var requestId = req.param('id');

    Request.findOneById(requestId).exec(function (err, request) {
      if (err) {
        return res.serverError(err);
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

          if (request.Type == 'order') {
            table.Status = 'ordered';
            table.OrderItems = table.OrderItems ? table.OrderItems.concat(request.OrderItems) : request.OrderItems;
          }

          table.save(function (err) {
            if (err) {
              return res.serverError(err);
            }

            var message = {
              setRequest: request.getMessage(table.TableName),
              setTable: table
            }

            Restaurant.message(request.Restaurant, message);
            return res.json(message);
          });
        });
      });
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to RequestController)
   */
  _config: {}


};

function createOrder (req, res, table, restaurantId, type) {
  if (table.Status == 'paying' || table.Status == 'paid') {
    return res.badRequest('Cannot request order when table is ' + table.Status);
  }

  var orderItems = req.body.OrderItems;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length == 0) {
    return res.badRequest('Missing required field: OrderItems');
  }

  var validateCount = 0;
  for (var i = orderItems.length - 1; i >= 0; i--) {
    var menuItemId = orderItems[i];

    sails.log.debug('validate menuItemId = ' + menuItemId + ', restaurantId = ' + restaurantId);
    MenuItem.findOne({
      id: menuItemId,
      Restaurant: restaurantId
    }).exec(function (err, menuItem) {
      if (err) {
        return res.serverError(err);
      }

      if (!menuItem) {
        return res.badRequest('Invalid OrderItem = ' + menuItemId);
      }

      if (++validateCount == orderItems.length) {
        var request = {
          Table: table.id,
          Restaurant: restaurantId,
          Type: type,
          OrderItems: orderItems
        };



        return createRequest(res, request, table);
      }
    });
  }
}

function createPay (req, res, table, restaurantId, type) {
  var payType = req.body.PayType;
  var payAmount = req.body.PayAmount;

  if (!payType || !payAmount ) {
    return res.badRequest('Missing required fields: payType, payAmount')
  }

  var request = {
    Table: table.id,
    Restaurant: restaurantId,
    Type: type,
    PayType: payType,
    PayAmount: payAmount
  };

  table.Status = 'paying';
  table.StatusUpdateAt = new Date();

  return createRequest(res, request, table);
}

function createRequest (res, request, table) {
  Request.create(request).exec(function (err, requestCreated) {
    if (err) {
      return res.serverError(err);
    }

    sails.log('1 request created');
    sails.log('  id = ' + requestCreated.id);

    table.Requests.add(requestCreated.id);
    table.save(function (err, tableUpdated) {
      if (err) {
        return res.serverError(err);
      }

      sails.log('1 table updated');
      sails.log('  id = ' + tableUpdated.id);

      var message = {
        newRequest: requestCreated.getMessage(tableUpdated.TableName),
        setTable: tableUpdated
      };

      // publish a message to the restaurant.
      // every client subscribed to the restaurant will get it.
      Restaurant.message(requestCreated.Restaurant, message);
      return res.json(message);
    });

  });
}

function bumpImportance (res, existingRequest, table, restaurantId) {
  existingRequest.Importance = parseInt(existingRequest.Importance) == 0 ? 1 : 1;
  existingRequest.save(function (err) {
    if (err) {
      return res.serverError(err);
    }

    var message = {
      setRequest: existingRequest.getMessage(table.TableName)
    };

    // publish a message to the restaurant.
    // every client subscribed to the restaurant will get it.
    Restaurant.message(restaurantId, message);
    return res.json(message);
  });
}