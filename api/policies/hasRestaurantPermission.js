/**
 * hasRestaurantPermission
 *

 * @module      :: Policy
 * @description :: Policy to allow any restaurant admin user
 * @check feild :: restaurantId
 * @pass condition:: subscriber, or admin, or manager
 */
module.exports = function(req, res, next) {
  var restaurantId = req.body.RestaurantId;
  var subscribedRestaurant = req.session.subscribedRestaurant;
  var currentUser = req.session.user;

  if (typeof restaurantId == 'undefined') {
    return res.badRequest('Missing required fields: restaurantId');
  }

  sails.log('policy - hasRestaurantPermission: restaurantId = ' + restaurantId);

  // is subscriber to restaurant ==> has permission
  sails.log.debug('If request client has subscribed to restaurant id = ' + restaurantId);
  if (subscribedRestaurant && subscribedRestaurant.id == restaurantId) {
    sails.log.debug('has subscribed');
    return next();
  }

  sails.log.debug('not subscribed');

  // not login ==> no permission
  if (!currentUser) {
    return res.forbidden('Not login');
  }

  // is admin or manager ==> has permission
  Restaurant.findOneById(restaurantId).populate('Manager').populate('Admins').exec(function (err, restaurant){
    if (err) {
      return res.serverError(err);
    }

    if (!restaurant) {
      return res.forbidden('invalid restaurantId = ' + restaurantId);
    }

    sails.log.debug('If user ' + currentUser.Email + ' has permission to ' + restaurant.RestaurantName);

    var hasPermission = false;
    if (currentUser.Role == 'manager' && restaurant.Manager.id == currentUser.id) {
      hasPermission = true;
    } else {
      for (var i = restaurant.Admins.length - 1; i >= 0; i--) {
        if (currentUser.Role == 'admin' && restaurant.Admins[i].id == currentUser.id) {
          hasPermission = true;
          break;
        }
      }
    }

    sails.log.debug(hasPermission ? 'has permission' : 'no permission');

    if (!hasPermission) {
      return res.forbidden('invalid restaurantId = ' + restaurantId);
    }

    return next();
  });
};
