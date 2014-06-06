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
  show: function (req, res, next) {
    Request.findOne(req.param('id'), function (err, request) {
      if (err) return next(err);
      if (!Request) return next();
      res.view({
        request: request
      });
    });
  },

  list: function (req, res, next) {
    Request.find(function (err, requests) {
      if (err) return next(err);
      if (!Request) return next();
      res.view({
        requests: requests
      });
    });
  },
  
  create: function (req, res, next) {
    Table.findOne({
      RestaurantName: req.param("RestaurantName"),
      TableName: req.param("TableName")
    }).done(function(err, table){
      if (typeof table == "undefined") {
        res.send("Not exist: Table [" + table.TableName + "] in Restaurant [" + table.RestaurantName + "]");
        return;
      } else {
        Request.create({
          RestaurantName: req.param("RestaurantName"),
          TableName: req.param("TableName"),
          Type: req.param("Type"),
          PayType: req.param("PayType")
        }).done(function(err, request) {
          Table.publishCreate({
            id: request.id,
            RestaurantName: table.RestaurantName, 
            TableName: table.TableName,
            Type: request.Type,
            PayType: request.PayType,
            Status: request.Status,
          });
          res.redirect('/request/show/' + request.id);
        });
      }
    });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to RequestController)
   */
  _config: {}

  
};
