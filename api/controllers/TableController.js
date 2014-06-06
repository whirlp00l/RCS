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
  show: function (req, res, next) {
    Table.findOne(req.param('id'), function (err, table) {
      if (err) return next(err);
      if (!Table) return next();
      res.view({
        table: table
      });
    });
  },

  list: function (req, res, next) {
    Table.find(function (err, tables) {
      if (err) return next(err);
      if (!Table) return next();
      res.view({
        tables: tables
      });
    });
  },

  create: function (req, res, next) {
    Table.findOne({
      RestaurantName: req.param("RestaurantName"),
      TableName: req.param("TableName")
    }).done(function(err, table){
      if (typeof table != "undefined") {
        res.send("Table [" + table.TableName + "] already existed in Restaurant [" + table.RestaurantName + "]");
        return;
      } else {
        Table.create({
          RestaurantName: req.param("RestaurantName"),
          TableName: req.param("TableName")
        }).done(function(err, table) {
          Table.publishCreate({
            id: table.id,
            RestaurantName: table.RestaurantName, 
            TableName: table.TableName,
            Status: table.Status
          });
          res.redirect('/table/show/' + table.id);
        });
      }
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
