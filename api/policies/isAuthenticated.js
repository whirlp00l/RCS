/**
 * isAuthenticated
 *

 * @module      :: Policy
 * @description :: Policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.user;`
 *
 */
module.exports = function(req, res, next) {

  sails.log('policy - isAuthenticated: req.session.user = ' + req.session.user);

  if (req.session.user) {
    User.findOneById(req.session.user.id).exec(function (err, user){
      if (err){
        return res.ServerError(err);
      }

      if (typeof user == 'undefined') {
        return res.forbidden();
      }

      return next();
    });
  } else {
      // console.log("User not login");
      return res.forbidden();
  }

};
