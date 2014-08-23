/**
 * hasRequestPermission
 *

 * @module      :: Policy
 * @description :: Policy to allow any user who has permission to manage the request
 * @check feild :: {requestId:id}, or /id
 * @pass condition:: subscriber, or admin, or manager
 *
 */
module.exports = function(req, res, next) {
  if (req.body) {
    var requestId = req.body.RequestId;
  }
  if (typeof requestId == 'undefined') {
    var requestId = req.param('id');
  }

  var subscribedRestaurant = req.session.subscribedRestaurant;
  var currentUser = req.session.user;

  if (typeof requestId == 'undefined') {
    return res.badRequest('Missing required fields: requestId');
  }

  sails.log('policy - hasRequestPermission: requestId = ' + requestId);

  Request.findOneById(requestId).populate('Restaurant').exec(function (err, request){
    if (err) {
      return res.serverError(err);
    }

    if (!request) {
      return res.forbidden('invalid requestId = ' + requestId);
    }

    sails.log.debug('If request client has subscribed to restaurant id = ' + request.Restaurant.id);

    // subscribed to restaurant ==> has permission to request
    if (subscribedRestaurant && subscribedRestaurant.id == request.Restaurant.id) {
      sails.log.debug('has subscribed');
      return next();
    }

    sails.log.debug('not subscribed');

    // not login ==> no permission
    if (!currentUser) {
      return res.forbidden('Not login');
    }

    // is admin or manager ==> has permission
    Restaurant.findOneById(request.Restaurant.id).populate('Manager').populate('Admins').exec(function (err, restaurant){
      if (err) {
        return res.serverError(err);
      }

      if (!restaurant) {
        return res.forbidden('invalid requestId = ' + requestId);
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
        return res.forbidden('invalid requestId = ' + requestId);
      }

      return next();
    });
  });
};
