/**
 * api/responses/rcsSignInFail.js
 *
 * This will be available in controllers as res.rcsSignInFail();
 */

module.exports = function() {

  var req = this.req;
  var res = this.res;

  var statusCode = 433;
  var message = 'Login authentication failed.'

  var result = {
    status: statusCode,
    message: message,
  };

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