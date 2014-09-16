/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  beforeCreate: function (attrs, next) {
    var bcrypt = require('bcrypt');
    bcrypt.genSalt(10, function(err, salt){
      if (err) return next(err);
      bcrypt.hash(attrs.Password, salt, function(err, hash) {
        if (err) return next(err);
        attrs.Password = hash;
        next();
      });
    });
  },

  attributes: {
    Email : {
      type: 'string',
      required: true,
      email: true,
      unique: true
    },

    Password: {
      type: 'string',
      required: true,
      minLength: 6
    },

    Role: {
      type: 'string',
      required: true,
      in: ['admin', 'manager']
    },

    Name: {
      type: 'string'
    },

    ManagedRestaurant: { // One to many
      collection: 'restaurant',
      via: 'Manager'
    },

    AdministeredRestaurant: { // Many to many
      collection: 'restaurant',
      via: 'Admins',
      dominant: true
    },

    toJSON: function() {
      var obj = this.toObject();
      if (obj.Password) {
        delete obj.Password;
      }
      return obj;
    }
  }
};
