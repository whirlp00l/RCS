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

  sails.log('policy - isLinkedTabletOfRestaurant');
  sails.log('  restaurantId: ' + restaurantId);
  sails.log('  tableId: ' + tableId);
  sails.log('  token: ' + token);

  if (typeof restaurantId == 'undefined' || typeof tableId == 'undefined' || !token) {
    return res.rcsMissingFields(['RestaurantId', 'TableId', 'Token']);
  }

  Table.findOne({
    Restaurant: restaurantId,
    id: tableId
  }).exec(function (err, table) {
    if (err) {
      return res.serverError(err);
    }

    if (!table) {
      return res.rcsTableNotFound({tableId:tableId});
    }

    sails.log('  expected token: ' + table.Token);
    if (table.Token != token) {
      return res.rcsTableInvalidToken();
    }

    return next();
  });
};
