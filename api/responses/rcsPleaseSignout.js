/**
 * api/responses/rcsPleaseSignout.js
 *
 * This will be available in controllers as res.rcsPleaseSignout(signedInUser);
 */

module.exports = function(signedInUser) {

  var req = this.req;
  var res = this.res;

  var statusCode = 423;
  var message = 'Need to sign out previous signed in user.'

  var result = {
    status: statusCode,
    message: message,
  };

  // Optional message
  if (signedInUser) {
    result.data = {
      signedInUser: signedInUser
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