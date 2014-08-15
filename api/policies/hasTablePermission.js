/**
 * hasTablePermission
 *

 * @module      :: Policy
 * @description :: Policy to allow any user who has permission to manage the table
 *
 */
module.exports = function(req, res, next) {
  var tableId = req.param('id');
  var subscribedRestaurant = req.session.subscribedRestaurant;

  if (typeof tableId == 'undefined') {
    return res.badRequest('Missing required fields: tableId');
  }

  sails.log('policy - hasTablePermission: tableId = ' + tableId);

  // not subscribed to restaurant ==> no permission to table
  if (!subscribedRestaurant) {
    return res.forbidden('Not subscribed');
  }

  Table.findOneById(tableId).populate('Restaurant').exec(function (err, table){
    if (err) {
      return res.serverError(err);
    }

    if (!table) {
      return res.forbidden('invalid tableId = ' + tableId);
    }

    sails.log.debug('If request client has subscribed to restaurant id = ' + table.Restaurant.id);

    // subscribed to restaurant ==> has permission to table
    if (subscribedRestaurant.id == table.Restaurant.id) {
      sails.log.debug('has subscribed');
      return next();
    }

    sails.log.debug('not subscribed');
    return res.forbidden('Invalid tableId = ' + tableId);
  });
};
