/**
 * Bill
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
    TotalPrice: {
      type: 'float',
      required: true,
      notEmpty: true,
      min:0
    },
    Order: {
      type: 'json',
      required: true,
      notEmpty: true
    },
    PayType: {
      type: 'string',
      in: ['cash', 'card', 'alipay'],
      notEmpty: true
    },
    /* e.g.
    nickname: 'string'
    */
    
  }

};
