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
    User.destroy({}).exec(function (err) {
      return res.send('All users deleted');
    });
  },

  login: function (req, res) {
    var email = req.body.Email;
    var password = req.body.Password;

    if (req.session.user && req.session.user.Email != email) {
      return res.badRequest('Already logged in as [' + req.session.user.Email + '].');
    }

    if (!email || !password) {
      return res.badRequest('Missing required fields.')
    }

    var bcrypt = require('bcrypt');

    User.findOneByEmail(req.body.Email).exec(function (err, user) {
      if (err) {
        return res.serverError(err);
      }
      if (user) {
        bcrypt.compare(password, user.Password, function(err, match){
          if (err) {
            return res.serverError(err);
          }

          if (match) {
            req.session.user = user;
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
    res.json({message: 'User ' + user.Email + ' has been logged out'}, 200);
  },

  create: function (req, res, next) {
    var email = req.body.Email;
    var password = req.body.Password;
    var role = req.body.Role;

    if (!email || !password || !role) {
      return res.badRequest('Missing required fields.')
    }

    var key = req.body.Key;

    User.findOneByEmail(email).exec(function (err, user) {
      if (typeof user != 'undefined') {
        return res.badRequest('User email [' + email + '] has already been registered.');
      }

      if (role == 'manager') {
        //TODO: read from Key Store
        if (!key || key !== 'key') {
          return res.badRequest('Invalid key "' + key + '"');
        }
      }

      User.create({
        Email: email,
        Password: password,
        Role: role
      }).exec(function (err, user) {
        if (err) {
          return res.serverError(err);
        }
        return res.json(user);
      })
    })
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}


};
