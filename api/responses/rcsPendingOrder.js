/**
 * api/responses/rcsPendingOrder.js
 *
 * This will be available in controllers as res.rcsPendingOrder([11, 2, 5]);
 */

module.exports = function(pendingOrderItems) {

  var req = this.req;
  var res = this.res;

  var statusCode = 412;
  var message = 'There is previous order request pending processed by Restaurant.'

  var result = {
    status: statusCode,
    message: message
  };

  // Optional message
  if (pendingOrderItems) {
    result.data = {
      pendingOrderItems: pendingOrderItems
    };
  }

  // If the user-agent wants a JSON response, send json
  if (req.wantsJSON) {
    return res.json(result, result.status);
  }

  // Set status code and view locals
  res.status(result.status);
  for (var key in result) {
    res.locals[key] = result[key];
  }

  return res.end();
};