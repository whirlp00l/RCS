/**
 * Table
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  autosubscribe: ['destroy', 'update'],
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
    TableType: {
      type: 'string'
    },
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
    Token: {
      type: 'string'
    },
    LinkedTabletId: {
      type: 'string'
    },
    LinkTime: {
      type: 'datetime'
    },
    RequestCount: {
      type: 'int',
      defaultsTo: 0
    },
    StatusUpdateAt: {
      type: 'datetime'
    },
    BookName: {
      type: 'string'
    },
    BookCell: {
      type: 'string'
    },
    BookDateTime: {
      type: 'datetime'
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