/**
 * UserController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  deleteAll: function (req, res, next) {
    User.find().done(function (err, users) {
      if (users.length == 0) {
        res.send("No User");
      }
      for (var i = 0 ;i < users.length; i++) {
        users[i].destroy(function() {
          console.log("deleted User " + users[i].Email)
          if (i == users.length - 1) {
            res.send("User all deleted");
          }
        });
      }
    });
  },

  login: function (req, res) {
    // if (req.session.user) {
    //   return res.badRequest("Already logged in as [" + req.session.user + "].");
    // }

    var email = req.body.Email;
    var password = req.body.Password;

    if (!email || !password) {
      return res.badRequest("Missing required fields.")
    }

    var bcrypt = require('bcrypt');

    User.findOneByEmail(req.body.Email).done(function (err, user) {
      if (err) {
        return res.serverError(err);
      }
      if (user) {
        bcrypt.compare(password, user.Password, function(err, match){
          if (err) {
            return res.json({error: 'Internal Server error'}, 500);
          }

          if (match) {
            req.session.user = user.Email;
            return res.json(user, 200);
          } else {
            req.session.user = null;
            return res.forbidden();
          }
        });
      } else {
        return res.forbidden();
      }
    });
  },
  
  logout: function(req, res){
    var user = req.session.user;
    req.session.user = null;
    res.json({message: 'User ' + user + ' has been logged out'}, 200);
  },

  create: function (req, res, next) {
    var email = req.body.Email;
    var password = req.body.Password;
    var role = req.body.Role;

    if (!email || !password || !role) {
      return res.badRequest("Missing required fields.")
    }

    User.findOneByEmail(email).done(function (err, user) {
      if (typeof user != "undefined") {
        return res.badRequest("User email [" + email + "] has already been registered.");
      } else {
        User.create({
          Email: email,
          Password: password,
          Role: role
        }).done(function (err, user) {
          if (err) {
            return res.serverError(err);
          }
          return res.json(user);
        })
      }
    })
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
