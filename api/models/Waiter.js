/**
* Waiter.js
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

    Online: {
      type: 'boolean',
      defaultsTo: false
    },

    Busy: {
      type: 'boolean',
      defaultsTo: false
    },

    Restaurant: { // Many to one
      model: 'restaurant'
    }
  }
};

