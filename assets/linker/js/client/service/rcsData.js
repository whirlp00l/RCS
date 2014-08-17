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
        return data.restaurant.id;
      }

      rcsData.getRestaurantName = function () {
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