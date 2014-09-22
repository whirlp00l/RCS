/**
 * api/responses/rcsMissingFields.js
 *
 * This will be available in controllers as res.rcsMissingFields(['requiredField1', 'requiredField2']);
 */

module.exports = function(requiredFields) {

  var req = this.req;
  var res = this.res;

  var statusCode = 414;
  var message = 'There are missing fields in the request.'
  var data = { missingFields: [] };

  for (var i = requiredFields.length - 1; i >= 0; i--) {
    if (typeof req.param(requiredFields[i]) == 'undefined') {
      data.missingFields.push(requiredFields[i]);
    }
  };

  var result = {
    status: statusCode,
    message: message,
    data: data
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