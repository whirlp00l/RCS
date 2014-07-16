/**
 * isManager
 *
 * @module      :: Policy
 * @description :: Policy to allow only Manager
 *                 Assumes that your login action in one of your controllers sets `req.session.role = 'manager';`
 *
 */
module.exports = function(req, res, next) {

  if (req.session.userRole && req.session.userRole == 'manager') {
    return next();
  } else {
    return res.forbidden();
  }

};
