/**
 * hasTablePermission
 *

 * @module      :: Policy
 * @description :: Policy to allow any user who has permission to manage the table
 * @check feild :: {tableId:id}, or /id
 * @pass condition:: subscriber, or admin, or manager
 *
 */
module.exports = function(req, res, next) {
  var tableId = req.body.TableId;
  if (typeof tableId == 'undefined') {
    var tableId = req.param('id');
  }

  var subscribedRestaurant = req.session.subscribedRestaurant;
  var currentUser = req.session.user;

  if (typeof tableId == 'undefined') {
    return res.badRequest('Missing required fields: tableId');
  }

  sails.log('policy - hasTablePermission: tableId = ' + tableId);

  Table.findOneById(tableId).populate('Restaurant').exec(function (err, table){
    if (err) {
      return res.serverError(err);
    }

    if (!table) {
      return res.forbidden('invalid tableId = ' + tableId);
    }

    sails.log.debug('If request client has subscribed to restaurant id = ' + table.Restaurant.id);

    // subscribed to restaurant ==> has permission to table
    if (subscribedRestaurant && subscribedRestaurant.id == table.Restaurant.id) {
      sails.log.debug('has subscribed');
      return next();
    }

    sails.log.debug('not subscribed');

    // not login ==> no permission
    if (!currentUser) {
      return res.forbidden('Not login');
    }

    // is admin or manager ==> has permission
    Restaurant.findOneById(table.Restaurant.id).populate('Manager').populate('Admins').exec(function (err, restaurant){
      if (err) {
        return res.serverError(err);
      }

      if (!restaurant) {
        return res.forbidden('invalid tableId = ' + tableId);
      }

      sails.log.debug('If user ' + currentUser.Email + ' has permission to ' + restaurant.RestaurantName);

      var hasPermission = false;
      if (restaurant.Manager.id == currentUser.id) {
        hasPermission = true;
      } else {
        for (var i = restaurant.Admins.length - 1; i >= 0; i--) {
          if (restaurant.Admins[i].id == currentUser.id) {
            hasPermission = true;
            break;
          }
        }
      }

      sails.log.debug(hasPermission ? 'has permission' : 'no permission');

      if (!hasPermission) {
        return res.forbidden('invalid tableId = ' + tableId);
      }

      return next();
    });
  });
};
