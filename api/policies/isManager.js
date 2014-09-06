/**
 * isManager
 *
 * @module      :: Policy
 * @description :: Policy to allow only Manager
 *                 Assumes that your login action in one of your controllers sets `req.session.user';`
 *
 */
module.exports = function(req, res, next) {

  sails.log('policy - isManager: req.session.user.Role = ' + req.session.user.Role);

  if (req.session.user.Role && req.session.user.Role == 'manager') {
    return next();
  } else {
    return res.forbidden();
  }

};
