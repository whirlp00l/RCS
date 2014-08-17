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
            return createOther(req, res, table, restaurantId, type);
        }
      } else {
        // increase the priority
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

      if (!request) {
        return res.badRequest('Invalid requestId = ' + requestId);
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

var createOrder = function (req, res, table, restaurantId, type) {
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
        Request.create({
          Table: table.id,
          Restaurant: restaurantId,
          Type: type,
          OrderItems: orderItems
        })
        .exec(function (err, request) {
          table.Requests.add(request.id);
          table.Status = 'ordering'; // check current status for blocking?
          table.StatusUpdateAt = new Date();

          table.save(function (err, table) {
            if (err) {
              return res.serverError(err);
            }

            // publish a message to the restaurant.
            // every client subscribed to the restaurant will get it.
            Restaurant.message(table.Restaurant, {
              newRequest: getRequestMessage(request, table),
              setTable: table
            });

            return res.json({
              newRequest: getRequestMessage(request, table),
              setTable: table
            });
          });
        });
      }
    });
  }
}

var createPay = function (req, res, table, restaurantId, type) {
  var payType = req.body.PayType;
  var payAmount = req.body.PayAmount;

  if (!payType || !payAmount ) {
    return res.badRequest('Missing required fields: payType, payAmount')
  }

  Request.create({
    Table: table.id,
    Restaurant: restaurantId,
    Type: type,
    PayType: payType,
    PayAmount: payAmount
  })
  .exec(function (err, request) {
    table.Requests.add(request.id);
    table.Status = 'paying';
    table.StatusUpdateAt = new Date();

    table.save(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      // publish a message to the restaurant.
      // every client subscribed to the restaurant will get it.
      Restaurant.message(table.Restaurant, {
        newRequest: getRequestMessage(request, table),
        setTable: table
      });

      return res.json({
        newRequest: getRequestMessage(request, table),
        setTable: table
      });
    });
  });
}

var createOther = function (req, res, table, restaurantId, type) {
  Request.create({
    Table: table.id,
    Restaurant: restaurantId,
    Type: type
  })
  .exec(function (err, request) {
    table.Requests.add(request.id);

    table.save(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      // publish a message to the restaurant.
      // every client subscribed to the restaurant will get it.
      Restaurant.message(table.Restaurant, {
        newRequest: getRequestMessage(request, table),
        setTable: table
      });

      return res.json({
        newRequest: getRequestMessage(request, table),
        setTable: table
      });
    });
  });
}

var bumpImportance = function (res, request, table, restaurantId) {
  request.Importance = parseInt(request.Importance) == 0 ? 1 : 1;
  request.save(function (err) {
    if (err) {
      return res.serverError(err);
    }

    Restaurant.message(restaurantId, {
      setRequest: getRequestMessage(request, table)
    });

    return res.json({
      setRequest: getRequestMessage(request, table)
    });
  });
}

var getRequestMessage = function (request, table) {
  sails.log.debug('getRequestMessage(' + request + ', ' + table + ')');
  return {
    id: request.id,
    Type: request.Type,
    Status: request.Status,
    Importance: request.Importance,
    createdAt: request.createdAt,
    PayType: request.PayType,
    PayAmount: request.PayAmount,
    OrderItems: request.OrderItems,
    Table: {
      TableName: table.TableName
    }
  }
}