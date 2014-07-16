/**
 * isLinkedTablet
 *
 * @module      :: Policy
 * @description :: Policy to allow only linked tablet
 *                 Assumes the request.body.TableId and request.body.Token is set by client
 *
 */
module.exports = function(req, res, next) {

  var tableId = req.body.TableId;
  var token = req.body.Token;

  if (!tableId || !token) {
    return res.forbidden();
  }
  Table.findOneById(tableId).done(function (err, table) {
    if (err) {
      return res.serverError(err);
    }

    if (table.Token != token) {
      return res.forbidden();
    }

    return next();
  })
};
