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
        console.log(hash);
        next();
      });
    });
  },

  attributes: {
    Email : 'string',
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

     toJSON: function() {
      var obj = this.toObject();
      delete obj.Password;
      return obj;
    }
  }
};
