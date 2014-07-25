/**
 * Table
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  autosubscribe: ['destroy', 'update', 'add:Requests', 'remove:Requests'],

  attributes: {
    RestaurantName: {
      type: 'string',
      // required: true,
      // notEmpty: true
    },

    TableName: {
      type: 'string',
      required: true,
      notEmpty: true
    },

    TableType: 'string',

    Status: {
      type: 'string',
      in: ['empty', 'ordering', 'ordered', 'paying', 'paid'],
      defaultsTo: 'empty'
    },

    MapRow: {
      type: 'int',
      required: true,
      notEmpty: true
    },

    MapCol: {
      type: 'int',
      required: true,
      notEmpty: true
    },

    Token: 'string',

    LinkedTabletId: 'string',

    LinkTime: 'datetime',

    RequestCount: {
      type: 'int',
      defaultsTo: 0
    },

    StatusUpdateAt: {
      type: 'datetime'
    },

    BookName: 'string',

    BookCell: 'string',

    BookDateTime: 'datetime',

    Restaurant: { // Many to one
      model: 'restaurant',
      via: 'Tables'
    },

    Requests: { // One to many
      collection: 'request',
      via: 'Table'
    }
  },

  // beforeCreate: function(values, next) {
  //   console.log(this);
  //   _this.findOne({
  //     RestaurantName: values.RestaurantName,
  //     TableName: values.TableName
  //   }).done(function(err, table){
  //     if (typeof table == "undefined") {
  //       console.log("Create table: uniqueness checking passed");
  //       next();
  //     } else {
  //       throw "Create table: uniqueness checking fail";
  //     }
  //   });
  // }
};