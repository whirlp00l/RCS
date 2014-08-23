/**
 * TableController
 *
 * @module      :: Controller
 * @description  :: A set of functions called `actions`.
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
    Tables.destroy({}).exec(function (err) {
      return res.send('All tables deleted');
    });
  },

  list: function(req, res) {
    // called by tablet with login
    var restaurantId = req.body.RestaurantId;

    Table.find({Restaurant: restaurantId}).exec(function (err, tables) {
      if (err) {
        return res.serverError(err);
      }

      return res.json({
        RestaurantId: restaurantId,
        Tables: tables
      });
    });
  },

  create: function (req, res) {
    var restaurantId = req.body.RestaurantId;

    var tableName = req.body.TableName;
    var mapRow = req.body.MapRow;
    var mapCol = req.body.MapCol;
    var tableType = req.body.TableType;

    if (!tableName || !tableType || typeof mapRow == 'undefined' || typeof mapCol == 'undefined') {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOneById(restaurantId).populateAll('Table').exec(function (err, restaurant) {
      if (err) {
        return res.serverError(err);
      }

      if (!restaurant) {
        return res.badRequest('Invalid restaurantId = ' + restaurantId);
      }

      var tables = restaurant.Tables;
      for (var i = tables.length - 1; i >= 0; i--) {
        if (tables[i].TableName == tableName) {
          return res.badRequest('Table [' + tableName + '] already existed');
        }
        if (tables[i].MapRow == mapRow && tables[i].MapCol == mapCol) {
          return res.badRequest('Table [' + mapRow + ',' + mapCol + '] already existed');
        }
      };

      Table.create({
        Restaurant: restaurant.id,
        TableName: tableName,
        TableType: tableType,
        MapRow: mapRow,
        MapCol: mapCol,
        StatusUpdateAt: new Date()
      }).exec(function (err, table) {
        if (err) {
          return res.serverError(err);
        }

        // publish a message to the restaurant.
        // every client subscribed to the restaurant will get it.
        Restaurant.message(restaurant, {newTable:table});

        return res.json(table);
      });

    })
  },

  delete: function (req, res) {
    var tableId = req.param('id');

    Table.findOneById(tableId).exec(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      if (!table) {
        return res.badRequest('Table [' + tableId + '] is invalid.');
      }

      table.destroy(function () {
        Request.destroy({Table: table.id}).exec(function (err, requests) {
          if (err) {
            return res.serverError(err);
          }

          var requestIds = [];
          for (var i = requests.length - 1; i >= 0; i--) {
            requestIds.push(requests[i].id);
          };

          Restaurant.message(table.Restaurant, {
            removeTableId:table.id,
            removeRequestId: requestIds
          });

          return res.json(table);
        })
      });
    });
  },

  book: function (req, res) {
    var tableId = req.param('id');
    var bookName = req.body.BookName;
    var bookCell = req.body.BookCell;
    var bookDateTime = req.body.BookDateTime;

    if (!bookName || !bookCell || !bookDateTime) {
      return res.badRequest('Missing required fields.')
    }

    updateTable(req, res, tableId, {
      BookName: bookName,
      BookCell: bookCell,
      BookDateTime: bookDateTime
    }, function (table) {
      return res.json(table);
    });
  },

  cancelBook:  function (req, res) {
    updateTable(req, res, req.param('id'), {
      BookName: null,
      BookCell: null,
      BookDateTime: null
    }, function (table) {
      return res.json(table);
    });
  },

  link: function (req, res) {
    var tableId = req.param('id');
    var tabletId = req.body.LinkedTabletId;

    if (!tabletId) {
      return res.badRequest('Missing required fields: ' + tabletId)
    }

    Table.findOneByLinkedTabletId(tabletId).exec(function (err, linkedTable) {
      if (linkedTable && linkedTable.id != tableId) {
        return res.badRequest('Tablet [' + tabletId + '] has already been linked to Table [' + linkedTable.TableName + '].');
      }

      Table.findOneById(tableId).exec(function (err, table) {
        if (err) {
          return res.serverError(err);
        }

        if (!table) {
          return res.badRequest('Table [' + tableId + '] is invalid.');
        }

        updateTable(req, res, tableId, {
          LinkedTabletId: tabletId,
          LinkTime: new Date(),
          Token: require('node-uuid').v4()
        }, function (table) {
          return res.json({
            id: table.id,
            Token: table.Token,
            LinkedTabletId: table.LinkedTabletId
          });
        });
      });
    });
  },

  removeLink: function (req, res) {
    updateTable(req, res, req.param('id'), {
      LinkedTabletId: null,
      LinkTime: null,
      Token: null
    }, function (table) {
      return res.json(table);
    });
  },

  reset: function (req, res) {
    var tableId = req.param('id');

    Request.findOne({
      Table: tableId,
      Or: [
        {Status: 'new'},
        {Status: 'inProgress'}
      ]
    }).exec(function (err, request) {
      if (err) {
        return res.serverError(err);
      }

      if (request) {
        return res.badRequest('Cannot reset table [' + tableId + ']. There is unclosed request [' + request.id + ']');
      }

      updateTable(req, res, tableId, {
        Status: 'empty',
        StatusUpdateAt: new Date(),
        OrderItems: null
      }, function (table) {
        return res.json(table);
      });
    })
  },

  newOrder: function (req, res) {
    updateOrder(req, res, true);
  },

  modifyOrder: function (req, res) {
    updateOrder(req, res, false);
  },

  listOrder: function (req, res) {
    var tableId = req.body.TableId;

    Table.findOneById(tableId).populate('Restaurant').exec(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      if (!table) {
        return res.badRequest('Invalid tableId = ' + tableId);
      }

      return res.json({
        OrderItems: table.OrderItems
      });
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to TableController)
   */
  _config: {}

};

var updateTable = function (req, res, tableId, value, cb) {
  if (!tableId) {
    return res.badRequest('Missing required fields.');
  }

  Table.findOneById(tableId).exec(function (err, table) {
    if (err) {
      return res.serverError(err);
    }

    if (!table) {
      return res.badRequest('Table [' + tableId + '] is invalid.');
    }

    // update each fields
    if (typeof value.BookName != 'undefined') {
      table.BookName = value.BookName;
    }

    if (typeof value.BookCell != 'undefined') {
      table.BookCell = value.BookCell;
    }

    if (typeof value.BookDateTime != 'undefined') {
      table.BookDateTime = value.BookDateTime;
    }

    if (typeof value.Token != 'undefined') {
      table.Token = value.Token;
    }

    if (typeof value.LinkedTabletId != 'undefined') {
      table.LinkedTabletId = value.LinkedTabletId;
    }

    if (typeof value.LinkTime != 'undefined') {
      table.LinkTime = value.LinkTime;
    }

    if (typeof value.Status != 'undefined') {
      table.Status = value.Status;
    }

    if (typeof value.StatusUpdateAt != 'undefined') {
      table.StatusUpdateAt = value.StatusUpdateAt;
    }

    if (typeof value.OrderItems != 'undefined') {
      table.OrderItems = value.OrderItems;
    }

    table.save(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      Restaurant.message(table.Restaurant, {setTable:table});

      cb(table);
    });
  });
}

var updateOrder = function (req, res, isNew) {
  var tableId = req.param('id');
  var orderItems = req.body.OrderItems;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length == 0) {
    return res.badRequest('Missing required field: OrderItems');
  }

  Table.findOneById(tableId).populate('Restaurant').exec(function (err, table) {
    if (err) {
      return res.serverError(err);
    }

    if (!table) {
      return res.badRequest('Invalid tableId = ' + tableId);
    }

    if (isNew === true && table.OrderItems) {
      return res.badRequest('Table order is not empty. tableId = ' + tableId);
    }

    var validateCount = 0;
    for (var i = orderItems.length - 1; i >= 0; i--) {
      var menuItemId = orderItems[i];
      sails.log.debug('validate menuItemId = ' + menuItemId + ', restaurantId = ' + table.Restaurant.id);
      MenuItem.findOne({
        id: menuItemId,
        Restaurant: table.Restaurant.id
      }).exec(function (err, menuItem) {
        if (err) {
          return res.serverError(err);
        }

        if (!menuItem) {
          return res.badRequest('Invalid OrderItem = ' + menuItemId);
        }

        if (++validateCount == orderItems.length) {

          updateTable(req, res, tableId, {
            OrderItems: orderItems,
            Status: 'ordered'
          }, function (table) {
            return res.json({
              OrderItems: orderItems
            });
          });
        }
      });
    };
  });
}