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
  mockCreate: function (req, res, next) {
    Table.find().done(function (err, tables) {
      for (var i = 0 ;i < tables.length; i++) {
        var payType = 'cash';
        if (Math.random() > 0.5) {
          payType = 'card';
        }

        Request.create({
          RestaurantName: 'KFC',
          TableName: tables[i].TableName,
          Type: 'pay',
          PayType: payType
        }).done(function(err, request) {
          Request.publishCreate({
            id: request.id,
            RestaurantName: request.RestaurantName,
            TableName: request.TableName,
            Type: request.Type,
            PayType: request.PayType,
            Status: request.Status,
            Importance: request.Importance
          });

          console.log('create request ' + request.id);
          if (i == tables.length - 1) {
            res.redirect('/request/');
          }
        });
      }
    });
  },

  deleteAll: function (req, res, next) {
    Request.find().done(function (err, requests) {
      if (requests.length == 0) {
        res.send('No Request');
      }
      for (var i = 0 ;i < requests.length; i++) {
        requests[i].destroy(function() {
          console.log('deleted request ' + requests[i].id)
          if (i == requests.length - 1) {
            res.send('Request all deleted');
          }
        });
      }
    });
  },

  list: function (req, res, next) {
    var restaurantName = req.body.RestaurantName;

    // TODO: filter on restaurantName

    Request.find(function (err, requests) {
      if (err) return next(err);
      if (!Request) return next();
      res.view({
        requests: requests
      });
    });
  },

  create: function (req, res, next) {
    var tableId = req.body.TableId;
    var type = req.body.Type;

    if (!tableId || !type ) {
      return res.badRequest('Missing required fields.')
    }

    var payType = req.body.PayType;
    var payAmount = req.body.PayAmount;

    Table.findOneById(tableId).done(function (err, table) {
      if (err) {
        return res.serverError(err);
      }

      if (typeof table == 'undefined') {
        return res.badRequest('Not exist: Table id = ' + tableId);
      }

      Request.findOne({
        id: tableId,
        Type: type,
        Or: [{Status: 'new'}, {Status: 'inProgress'}]
      }).done(function (err, request) {
        if (err) {
          return res.serverError(err);
        }

        if (typeof request == 'undefined') {
          Request.create({
            RestaurantName: table.RestaurantName,
            TableName: table.TableName,
            Type: type,
            PayType: payType,
            PayAmount: payAmount
          }).done(function(err, request) {
            if (err) {
              return res.serverError(err);
            }

            Request.publishCreate({
              id: request.id,
              RestaurantName: table.RestaurantName,
              TableName: table.TableName,
              Type: request.Type,
              PayType: request.PayType,
              PayAmount: request.PayAmount,
              Status: request.Status,
              Importance: request.Importance
            });

            table.RequestCount = parseInt(table.RequestCount) + 1;

            if (request.Type == 'pay') {
              table.Status = 'paying';
              table.StatusUpdateAt = new Date();
            }

            table.save(function (err) {
              if (err) {
                return res.serverError(err);
              }

              Table.publishUpdate(table.id, {
                RequestCount: table.RequestCount,
                Status: table.Status,
                StatusUpdateAt: table.StatusUpdateAt
              });

              return res.json(request);
            })
          });
        } else {
          // The same active Request exists, increase the priority
          request.Importance = parseInt(request.Importance) + 1;
          request.save(function (err) {
            if (err) {
              return res.serverError(err);
            }

            Request.publishUpdate(request.id, {
              Importance: request.Importance
            });
          })

          return res.json(request);
        }
      });
    });
  },

  close: function (req, res, next) {
    Request.findOne({id: req.param('id')}).done(function (err, request) {
      if (err) return res.send(500);
      if (!request) return res.send('No request with that id exists!', 404);

      request.Status = 'closed';
      request.ClosedAt = req.param('ClosedAt');

      request.save(function (err) {
        if (err) console.log(err);

        Table.findOne({
          RestaurantName: request.RestaurantName,
          TableName: request.TableName
        }).done(function (err, table) {
          table.RequestCount = parseInt(table.RequestCount) - 1;
          if (request.Type == 'pay') {
            table.Status = 'paid';
            table.StatusUpdateAt = new Date();
          }

          table.save(function (err) {
            if (err) console.log(err);

            Table.publishUpdate(table.id, {
              RequestCount: table.RequestCount,
              Status: table.Status,
              StatusUpdateAt: table.StatusUpdateAt
            });

            res.redirect('/request/' + request.id);
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
