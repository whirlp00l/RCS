/**
 * Restaurant
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  autosubscribe: ['destroy', 'update',
    'add:Admins', 'remove:Admins',
    'add:Tables', 'remove:Tables'],

  attributes: {

    RestaurantName: {
      type: 'string',
      required: true,
      notEmpty: true,
      unique: true
    },

    Description: {
      type: 'string'
    },

    Manager: { // Many to one
      model: 'user',
      via: 'ManagedRestaurant'
    },

    Admins: { // Many to many
      collection: 'user',
      via: 'AdministeredRestaurant'
    },

    Tables: { // One to many
      collection: 'table',
      via: 'Restaurant'
    },

    Requests: { // One to many
      collection: 'request',
      via: 'Restaurant'
    },

    Menu: { // One to many
      collection: 'menuItem',
      via: 'Restaurant'
    },

    MenuVersion: 'int',

    Waiters: { // One to many
      collection: 'waiter',
      via: 'Restaurant'
    },

    FlavorRequirements: {
      type: 'array'
    }
  }
};
