/**
* MenuItem.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    Name: {
      type: 'string',
      required: true,
      notEmpty: true
    },

    Price: {
      type: 'float',
      required: true,
      notEmpty: true
    },

    PremiumPrice: {
      type: 'float'
    },

    Restaurant: { // Many to one
      model: 'restaurant',
      via: 'Menu'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  }
};

