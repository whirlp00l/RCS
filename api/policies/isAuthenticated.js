/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // console.log('isAuthenticated?');

  if (req.session.user) {
    User.findOneByEmail(req.session.user).done(function (err, user){
      if(err){
        console.log(err);
        // console.log("User not exist:" + req.session.user);
        return res.json({error: 'Current User do not exist in DB'}, 500);
      } else {
        // console.log("User authenticated:" + user.Email + ", role:" + user.Role);
        return next();
      }
    });
  } else {
      // console.log("User not login");
      return res.forbidden();
  }

};
