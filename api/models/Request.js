/**
 * Request
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    Type: {
      type: 'string',
      in: ['pay', 'water', 'call', 'order'],
      required: true,
      notEmpty: true
    },

    PayType: {
      type: 'string',
      in: ['cash', 'card', 'alipay'],
      notEmpty: true
    },

    PayAmount: {
      type: 'float'
    },

    IsPremium: {
      type: 'boolean',
      defaultsTo: false
    },

    CellPhone: {
      type: 'int'
    },

    Status: {
      type: 'string',
      in: ['new', 'inProgress', 'closed'],
      required: true,
      notEmpty: true,
      defaultsTo: 'new'
    },

    Importance: {
      type: 'int',
      defaultsTo: 0
    },

    ClosedAt: {
      type: 'datetime'
    },

    Table: {
      model: 'table',
      via: 'Requests'
    },

    Restaurant: {
      model: 'restaurant',
      via: 'Requests'
    },

    OrderItems: 'array',

    FlavorRequirements: 'array',

    // Attributes methods
    getMessage: function (tableName) {
      return {
        id: this.id,
        Type: this.Type,
        Status: this.Status,
        Importance: this.Importance,
        createdAt: this.createdAt,
        ClosedAt: this.ClosedAt,
        PayType: this.PayType,
        PayAmount: this.PayAmount,
        IsPremium: this.IsPremium,
        CellPhone: this.CellPhone,
        OrderItems: this.OrderItems,
        FlavorRequirements: this.FlavorRequirements,
        Table: {
          TableName: tableName
        }
      };
    }
  }

};
