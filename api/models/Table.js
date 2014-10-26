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
    },

    OrderItems: 'array',

    FlavorRequirements: 'array',

    toJSON: function() {
      var obj = this.toObject();

      delete obj.createdAt;
      delete obj.updatedAt;
      delete obj.Token;

      var activeCount = 0;
      var closedCount = 0;
      if (obj.Requests) {
        for (var i = obj.Requests.length - 1; i >= 0; i--) {
          if (obj.Requests[i].Status == 'closed') {
            closedCount++;
          } else {
            activeCount++;
          }
        }
      }
      obj.ActiveRequestCount = activeCount;
      obj.ClosedRequestCount = closedCount;
      delete obj.Requests;

      if (obj.Restaurant.RestaurantName) {
        var restaurantName = obj.Restaurant.RestaurantName;
        delete obj.Restaurant;
        obj.Restaurant = {RestaurantName:restaurantName};
      }

      return obj;
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