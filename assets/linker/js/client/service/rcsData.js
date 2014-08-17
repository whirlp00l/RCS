angular
  .module('rcs')
  .service('rcsData', [
    function() {

      var rcsData = this;
      var data = {
        restaurant: null,
        onlineAdmins: [],
        tables: [],
        requests: []
      }

      // exposing
      rcsData.getRestaurantId = function () {
        if (data.restaurant == null ) {
          return null;
        }
        return data.restaurant.id;
      }

      rcsData.getRestaurantName = function () {
        if (data.restaurant == null ) {
          return null;
        }
        return data.restaurant.RestaurantName;
      }

      rcsData.setRestaurant = function (value) {
        data.restaurant = value;
      }

      rcsData.getTables = function () {
        return data.tables;
      }

      rcsData.setTables = function (value) {
        data.tables = value;
      }

      rcsData.getRequests = function () {
        return data.requests;
      }

      rcsData.setRequests = function (value) {
        data.requests = value;
      }

      rcsData.resetRestaurantData = function () {
        rcsData.data = {
          onlineAdmins: [],
          tables: [],
          requests: []
        }
      }

    }]);