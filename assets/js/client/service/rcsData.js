angular
  .module('rcs')
  .service('rcsData', ['rcsAPI', rcsData]);

function rcsData (rcsAPI) {
  var data = {
    restaurant: null,
    onlineAdmins: [],
    tables: [],
    requests: [],
    menuItems: []
  }

  var service = {
    getRestaurantId: function () {
      if (data.restaurant == null ) {
        return null;
      }
      return data.restaurant.id;
    },
    getRestaurantName: function () {
      if (data.restaurant == null ) {
        return null;
      }
      return data.restaurant.RestaurantName;
    },
    setRestaurant: function (value) {
      data.restaurant = value;
    },
    getTables: function () {
      return data.tables;
    },
    setTables: function (value) {
      data.tables = value;
    },
    getRequests: function () {
      return data.requests;
    },
    setRequests: function (value) {
      data.requests = value;
    },
    getMenuItems: function () {
      return data.menuItems;
    },
    setMenuItems: function (value) {
      data.menuItems = value;
    }
  };

  return service;
}