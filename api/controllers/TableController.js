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
  deleteAll: function (req, res, next) {
    Table.find().done(function (err, tables) {
      if (tables.length == 0) {
        res.send('No Table');
      }
      for (var i = 0 ;i < tables.length; i++) {
        tables[i].destroy(function() {
          console.log('deleted table' + tables[i].id)
          if (i == tables.length - 1) {
            res.send('Table all deleted');
          }
        });
      }
    });
  },

  list: function(req, res, next) {
    var currentUser = req.session.user;
    var restaurantName = req.body.RestaurantName;

    if (!restaurantName) {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOneByRestaurantName(restaurantName).done(function (err, restaurant){
      if (err) {
        return res.serverError(err);
      }

      if (!restaurant || restaurant.Admins.indexOf(currentUser) == -1) {
        return res.badRequest('Restaurant name [' + restaurantName + '] is not correct.');
      }

      Table.findByRestaurantName(restaurantName).done(function (err, tables){
        if (err){
          return res.ServerError(err);
        }

        // subscribe the requesting socket to the 'default' context of the tables
        Table.subscribe(req, tables);

        // subscribe the requesting socket to the 'message' context of the restaurant
        Restaurant.subscribe(req, restaurant, ['message']);

        return res.json(tables);
      });
    });
  },

  create: function (req, res, next) {
    var currentUser = req.session.user;
    var restaurantName = req.param('RestaurantName');
    var tableName = req.param('TableName');
    var mapRow = req.param('MapRow');
    var mapCol = req.param('MapCol');
    var tableType = req.param('TableType');

    sails.log.debug('currentUser: ' + currentUser);

    if (!currentUser || !restaurantName || !tableName || !tableType
     || typeof mapRow == 'undefined' || typeof mapCol == 'undefined') {
      return res.badRequest('Missing required fields.')
    }

    Restaurant.findOneByRestaurantName(restaurantName).exec(function (err, restaurant) {
      if (err) {
        return res.serverError(err);
      }

      if (!restaurant || restaurant.Admins.indexOf(currentUser) == -1) {
        return res.badRequest('Restaurant name [' + restaurantName + '] is not correct.');
      }

      Table.findOne({
        RestaurantName: restaurantName,
        TableName: tableName,
        MapRow: mapRow,
        MapCol: mapCol
      }).exec(function (err, table) {
        if (err) {
          return res.serverError(err);
        }

        if (table) {
          return res.badRequest('Table already existed');
        }

        Table.create({
          RestaurantName: restaurantName,
          TableName: tableName,
          TableType: tableType,
          MapRow: mapRow,
          MapCol: mapCol,
          StatusUpdateAt: new Date()
        }).exec(function (err, table) {
          // publish a message to the restaurant.
          // every client subscribed to the restaurant will get it.
          Restaurant.message(restaurant, {newTable:table});

          return res.json(table);
        });
      })
    })
  },

  book:  function (req, res, next) {
    Table.findOne({id: req.param('id')}).done(function (err, table) {
      if (err) return next(err);
      if (!table) return next();

      table.BookName = req.param('BookName');
      table.BookCell = req.param('BookCell');
      table.BookDateTime = req.param('BookDateTime');

      table.save(function (err) {
        if (err) console.log('save table err: ' + err);

        Table.publishUpdate(table.id, {
          BookName: table.BookName,
          BookCell: table.BookCell,
          BookDateTime: table.BookDateTime
        });

        res.redirect('/table/' + table.id);
      })
    });
  },

  cancelBook:  function (req, res, next) {
    Table.findOne({id: req.param('id')}).done(function (err, table) {
      if (err) return res.send(500);
      if (!table) return res.send('No table with id=' + req.param('id') + ' exists!', 404);

      table.BookName = null;
      table.BookCell = null;
      table.BookDateTime = null;

      table.save(function (err) {
        if (err) console.log('save table err: ' + err);

        Table.publishUpdate(table.id, {
          BookName: table.BookName,
          BookCell: table.BookCell,
          BookDateTime: table.BookDateTime
        });

        res.redirect('/table/' + table.id);
      })
    });
  },

  link:  function (req, res, next) {
    var tabletId = req.body.LinkedTabletId;
    var tableId = req.param('id');

    if (!tabletId || !tableId) {
      return res.send('Invalid LinkedTabletId [' + tabletId + ']', 500);
    }

    Table.findOneById(tableId).done(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      if (!table) {
        return res.badRequest('No table with id=' + tableId + ' exists!');
      }

      table.LinkedTabletId = tabletId;
      table.LinkTime = new Date();
      table.Token = require('node-uuid').v4();

      var saveAndReturn = function () {
        table.save(function (err) {
          if (err) {
            return res.serverError(err);
          }

          Table.publishUpdate(table.id, {
            LinkedTabletId: table.LinkedTabletId,
            LinkTime: table.LinkTime,
            Token: table.Token
          });

          res.json(table);
        })
      }

      Table.findOne({LinkedTabletId: table.LinkedTabletId}).done(function (err, oldTable) {
        if (oldTable) {
          oldTable.LinkedTabletId = null;
          oldTable.LinkTime = null;
          oldTable.Token = null;

          oldTable.save(function (err) {
            if (err) console.log('save oldTable err: ' + err);

            saveAndReturn();
          });
        } else {
          saveAndReturn();
        }
      });

    });
  },

  removeLink: function (req, res, next) {
    Table.findOne({id: req.param('id')}).done(function (err, table) {
      if (err) return res.send(500);
      if (!table) return res.send('No table with id=' + req.param('id') + ' exists!', 404);

      table.LinkedTabletId = null;
      table.LinkTime = null;
      table.Token = null;

      table.save(function (err) {
        if (err) console.log('save table err: ' + err);

        Table.publishUpdate(table.id, {
          LinkedTabletId: table.LinkedTabletId,
          LinkTime: table.LinkTime,
          Token: table.Token
        });

        res.redirect('/table/' + table.id);
      })
    });
  },

  reset: function (req, res, next) {
    Table.findOne({id: req.param('id')}).done(function (err, table) {
      if (err) return res.send(500);
      if (!table) return res.send('No table with id=' + req.param('id') + ' exists!', 404);

      Request.find({
        RestaurantName: table.RestaurantName,
        TableName: table.TableName,
        Or: [{Status: 'new'}, {Status: 'inProgress'}]
      }).done(function (err, requests) {

        var resetTable = function () {
          table.RequestCount = 0;
          table.Status = 'empty';
          table.StatusUpdateAt = new Date();

          table.save(function (err) {
            if (err) console.log('save table err: ' + err);

            Table.publishUpdate(table.id, {
              Status: table.Status,
              StatusUpdateAt: table.StatusUpdateAt,
              RequestCount: table.RequestCount
            });

            res.redirect('/table/' + table.id);
          })
        }

        if (requests.length == 0) {
          resetTable();
          return;
        }

        for (var i = 0; i < requests.length; i++) {
          requests[i].Status = 'closed';
          requests[i].ClosedAt = req.param('ClosedAt');
          requests[i].save(function () {
            Request.publishDestroy(requests[i].id);
            if (i == requests.length - 1) {
              resetTable();
            }
          })
        }
      });
    });
  },

  delete: function (req, res, next) {
    Table.findOne({id: req.param('id')}).done(function (err, table) {
      if (err) return next(err);
      if (!table) return next();

      Request.find({
        RestaurantName: table.RestaurantName,
        TableName: table.TableName,
        Or: [{Status: 'new'}, {Status: 'inProgress'}]
      }).done(function (err, requests) {
        var deleteTable = function () {
          table.destroy(function() {
            Table.publishDestroy(table.id);
            res.end();
          })
        }

        if (requests.length == 0) {
          deleteTable();
          return;
        }

        for (var i = 0; i < requests.length; i++) {
          requests[i].Status = 'closed';
          requests[i].ClosedAt = req.param('ClosedAt');
          requests[i].save(function () {
            Request.publishDestroy(requests[i].id);
            if (i == requests.length - 1) {
              deleteTable();
            }
          })
        }
      });
    });
  },
  // subscribe: function (req, res, next) {
  //   Table.find(function foundTables(err, tables) {
  //     if (err) return next(err);

  //     Table.subscribe(req.socket);

  //     Table.subscribe(req.socket, users);
  //   });
  // },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to TableController)
   */
  _config: {}

};