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

var updateTable = function (req, res, tableId, value, cb) {
  if (!tableId) {
    return res.badRequest('Missing required fields.');
  }

  Table.findOneById(tableId).populateAll().exec(function (err, table) {
    if (err) {
      return res.serverError(err);
    }

    if (!table || !table.Restaurant || hasPermission(table.Restaurant, req.session.user)) {
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

    table.save(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      Restaurant.message(table.Restaurant, {setTable:table});

      cb(table);
    });
  });
}

module.exports = {
  deleteAll: function (req, res) {
    Tables.destroy({}).exec(function (err) {
      return res.send('All tables deleted');
    });
  },

  list: function(req, res) {
    var currentUser = req.session.user;
    var restaurantName = req.body.RestaurantName;

    sails.log.debug('Table/list');

    if (!restaurantName) {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOneByRestaurantName(restaurantName).populateAll().exec(function (err, restaurant){
      if (err) {
        return res.serverError(err);
      }

      if (!restaurant || !hasPermission(restaurant, currentUser)) {
        return res.badRequest('Restaurant name [' + restaurantName + '] is invalid.');
      }

      Table.find({Restaurant: restaurant.id}).populate('Requests').exec(function (err, tables) {
        if (err) {
          return res.serverError(err);
        }

        return res.json(tables);
      });
    });
  },

  create: function (req, res) {
    var currentUser = req.session.user;
    var restaurantName = req.param('RestaurantName');
    var tableName = req.param('TableName');
    var mapRow = req.param('MapRow');
    var mapCol = req.param('MapCol');
    var tableType = req.param('TableType');

    sails.log.debug('currentUser.Email: ' + currentUser.Email);

    if (!currentUser || !restaurantName || !tableName || !tableType
     || typeof mapRow == 'undefined' || typeof mapCol == 'undefined') {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOneByRestaurantName(restaurantName).populateAll().exec(function (err, restaurant) {
      if (err) {
        return res.serverError(err);
      }

      if (!restaurant || !hasPermission(restaurant, currentUser)) {
        return res.badRequest('Restaurant name [' + restaurantName + '] is invalid.');
      }

      var tables = restaurant.Tables;
      for (var i = tables.length - 1; i >= 0; i--) {
        if (tables[i].TableNameName == tableName) {
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
    var currentUser = req.session.user;
    var tableId = req.param('id');

    Table.findOneById(tableId).populateAll().exec(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      if (!table || !table.Restaurant || hasPermission(table.Restaurant, currentUser)) {
        return res.badRequest('Table [' + tableId + '] is invalid.');
      }

      table.destroy(function () {
        Restaurant.message(table.Restaurant, {removeTable:table});

        return res.json(table);
      });

      // Request.find({
      //   RestaurantName: table.RestaurantName,
      //   TableName: table.TableName,
      //   Or: [{Status: 'new'}, {Status: 'inProgress'}]
      // }).exec(function (err, requests) {
      //   var deleteTable = function () {
      //     table.destroy(function() {
      //       Table.publishDestroy(table.id);
      //       res.end();
      //     })
      //   }

      //   if (requests.length == 0) {
      //     deleteTable();
      //     return;
      //   }

      //   for (var i = 0; i < requests.length; i++) {
      //     requests[i].Status = 'closed';
      //     requests[i].ClosedAt = req.param('ClosedAt');
      //     requests[i].save(function () {
      //       Request.publishDestroy(requests[i].id);
      //       if (i == requests.length - 1) {
      //         deleteTable();
      //       }
      //     })
      //   }
      // });
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

  link:  function (req, res, next) {
    var tableId = req.param('id');
    var tabletId = req.body.LinkedTabletId;

    if (!tabletId) {
      return res.badRequest('Missing required fields.')
    }

    Table.findOneByLinkedTabletId(tabletId).exec(function (err, linkedTable) {
      if (linkedTable) {
        return res.badRequest('Tablet [' + tabletId + '] has already been linked to Table [' + linkedTable.TableName + '].');
      }

      updateTable(req, res, tableId, {
        LinkedTabletId: tabletId,
        LinkTime: new Date(),
        Token: require('node-uuid').v4()
      }, function (table) {
        return res.json(table);
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
    updateTable(req, res, req.param('id'), {
      Status: 'empty',
      StatusUpdateAt: new Date()
    }, function (table) {
      return res.json(table);
    });

    // Table.findOne({id: req.param('id')}).exec(function (err, table) {
    //   if (err) return res.send(500);
    //   if (!table) return res.send('No table with id=' + req.param('id') + ' exists!', 404);

    //   Request.find({
    //     RestaurantName: table.RestaurantName,
    //     TableName: table.TableName,
    //     Or: [{Status: 'new'}, {Status: 'inProgress'}]
    //   }).exec(function (err, requests) {

    //     var resetTable = function () {
    //       table.RequestCount = 0;
    //       table.Status = 'empty';
    //       table.StatusUpdateAt = new Date();

    //       table.save(function (err) {
    //         if (err) console.log('save table err: ' + err);

    //         Table.publishUpdate(table.id, {
    //           Status: table.Status,
    //           StatusUpdateAt: table.StatusUpdateAt,
    //           RequestCount: table.RequestCount
    //         });

    //         res.redirect('/table/' + table.id);
    //       })
    //     }

    //     if (requests.length == 0) {
    //       resetTable();
    //       return;
    //     }

    //     for (var i = 0; i < requests.length; i++) {
    //       requests[i].Status = 'closed';
    //       requests[i].ClosedAt = req.param('ClosedAt');
    //       requests[i].save(function () {
    //         Request.publishDestroy(requests[i].id);
    //         if (i == requests.length - 1) {
    //           resetTable();
    //         }
    //       })
    //     }
    //   });
    // });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to TableController)
   */
  _config: {}

};