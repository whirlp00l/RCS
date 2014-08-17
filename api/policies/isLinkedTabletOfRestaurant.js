/**
 * isLinkedTabletOfRestaurant
 *
 * @module      :: Policy
 * @description :: Policy to allow only linked tablet
 * @check feild :: {restaurantId:id}
 * @pass condition:: table id+token match and belong to restaurant
 *
 */
module.exports = function(req, res, next) {
  var restaurantId = req.body.RestaurantId;
  var tableId = req.body.TableId;
  var token = req.body.Token;

  if (typeof restaurantId == 'undefined') {
    return res.badRequest('Missing required fields: RestaurantId');
  }

  sails.log('policy - isLinkedTabletOfRestaurant: restaurantId = ' + restaurantId);

  if (typeof tableId == 'undefined' || !token) {
    return res.forbidden();
  }

  Table.findOneById(tableId).populate('Restaurant').exec(function (err, table) {
    if (err) {
      return res.serverError(err);
    }

    if (!table || table.Token != token) {
      return res.forbidden();
    }

    sails.log.debug('token match');
    sails.log.debug('If table belong to ' + restaurantId);
    if (table.Restaurant.id !== restaurantId) {
      sails.log.debug('No');
      return res.forbidden();
    }

    sails.log.debug('Yes');
    return next();
  });
};
