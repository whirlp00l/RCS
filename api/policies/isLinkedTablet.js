/**
 * isLinkedTablet
 *
 * @module      :: Policy
 * @description :: Policy to allow only linked tablet
 * @check feild :: {tableId:id}, or /id
 * @pass condition:: token match
 *
 */
module.exports = function(req, res, next) {
  var tableId = req.body.TableId;
  if (typeof tableId == 'undefined') {
    var tableId = req.param('id');
  }

  var token = req.body.Token;

  if (typeof tableId == 'undefined') {
    return res.badRequest('Missing required fields: tableId');
  }

  sails.log('policy - isLinkedTablet: tableId = ' + tableId);

  if (typeof tableId == 'undefined' || !token) {
    return res.forbidden();
  }

  Table.findOneById(tableId).exec(function (err, table) {
    if (err) {
      return res.serverError(err);
    }

    if (!table || table.Token != token) {
      return res.forbidden();
    }

    sails.log.debug('token match');
    return next();
  });
};
