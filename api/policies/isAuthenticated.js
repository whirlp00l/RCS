/**
 * isAuthenticated
 *
 
 * @module      :: Policy
 * @description :: Policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.user;`
 *
 */
module.exports = function(req, res, next) {

  // console.log('isAuthenticated?');

  if (req.session.user) {
    User.findOneByEmail(req.session.user).done(function (err, user){
      if (err){
        console.log(err);
        // console.log("User not exist:" + req.session.user);
        return res.ServerError(err);
      } 

      if (typeof user == 'undefined') {
        return res.forbidden();
      }
      
      // console.log("User authenticated:" + user.Email + ", role:" + user.Role);
      return next();
    });
  } else {
      // console.log("User not login");
      return res.forbidden();
  }

};
