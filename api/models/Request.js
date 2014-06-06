/**
 * Request
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    RestaurantName: {
      type: 'string',
      required: true,
      notEmpty: true
    },
    TableName: {
      type: 'string',
      required: true,
      notEmpty: true
    },
    Type: {
      type: 'string',
      in: ['pay'],
      required: true,
      notEmpty: true
    },
    PayType: {
      type: 'string',
      in: ['cash', 'card', 'alipay'],
      notEmpty: true
    },
    Status: {
      type: 'string',
      in: ['new', 'inProgress', 'closed'],
      required: true,
      notEmpty: true,
      defaultsTo: 'new'
    }    
  }

};
