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



  login: function (req, res) {
    var bcrypt = require('bcrypt');
    User.findOneByEmail(req.body.email).done(function (err, user){
      if (err) res.json({error: 'DB error'}, 500);
      if (user) {
        bcrypt.compare(req.body.password, user.password, function(err, match){
          if(err) res.json({error: 'Server error'}, 500);
          if(match) {
            req.session.user = user.email;
            res.json(user);
          } else {
            if(req.session.user) req.session.user = null;
            res.json({error: 'Invalid password'}, 400);
          }
        });
      } else {
        res.json({error: 'User not found'}, 404);
      }
    });
  },
  
  logout: function(req, res){
    if(req.session.user){
      console.log("current user: " + req.session.user);
      req.session.user = null;
      res.send("Successfully logged out");
    } else {
      res.send("Not logged in yet");
    }
  },

  addRestaurant: function(req, res){
    if(req.session.user) {//检验是否登陆
      User.findOneByEmail(req.session.user).done(function (err, user){
        if(err){
          console.log(err);
          res.json({error: 'Current User do not exist in DB'}, 500);
        } else {
          console.log("User found:" + user.email);
          Restaurant.find({UserName: user.email, RestaurantName: req.body.RestaurantName}).done(function (err, rest){
            if(err){
              console.log(err);
            } else {
              console.log(rest);
              if(rest.length > 0)
              console.log("already exist");
              else{
                Restaurant.create({UserName: user.email, RestaurantName: req.body.RestaurantName}).done(function (err, rest){
                  if(err){
                      console.log(err);
                    } else {
                      console.log(rest);
                    }
                });
              }
            }
          });
        }
      res.json(user);
    });
    } else {
      res.json({error: 'Please login first'}, 403);
    }
  },
  
  listRestaurant: function (req, res, next) {
    if(req.session.user){
      console.log("current user:" + req.session.user);
      Restaurant.findByUserName(req.session.user).done(function (err, rests){
        if(err){
          console.log(err);
          res.json({error: "DB error"}, 500);
        } else {
          res.json(rests);
        }
      });
    } else {
      res.send("Not logged in yet")
    }
  },

  mockDelete: function (req, res, next) {
    Restaurant.find().done(function (err, requests) {
      if (requests.length == 0) {
        res.end();
      }
      for (var i = 0 ;i < requests.length; i++) {
        requests[i].destroy(function() {
          console.log("deleted Restaurant" + requests[i].id)
          if (i == requests.length - 1) {
            res.end();
          }
        });
      }
    });
  },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
