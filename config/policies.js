/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  // '*': true,
  '*': false,

  'Template':
  {
    '*': true
  },

  'User':
  {
    'deleteAll': true, // test only

    'logout': true,
    'login': true,
    'create': true,
    'handshake': true
  },

  'Restaurant':
  {
    'deleteAll': true, // test only

    'list': 'isAuthenticated',
    'create': ['isAuthenticated', 'isManager'],
    'subscribe': ['isAuthenticated', 'hasRestaurantPermission'],
    'unsubscribe': true,
    'addAdmin': ['isAuthenticated', 'isManager', 'hasRestaurantPermission'],
    'removeAdmin': ['isAuthenticated', 'isManager', 'hasRestaurantPermission'],
    'listAdmin': ['isAuthenticated', 'isManager', 'hasRestaurantPermission'],
    'checkMenuVersion': ['isAuthenticated', 'hasRestaurantPermission'],
    'listMenu': ['isAuthenticated', 'hasRestaurantPermission'],
    'downloadMenu': 'isLinkedTabletOfRestaurant',
    'checkMenuVersion': 'isLinkedTabletOfRestaurant',
    'listWaiter': ['isAuthenticated', 'hasRestaurantPermission'],
    'updateFlavorRequirements': ['isAuthenticated', 'hasRestaurantPermission']
  },

  'Table':
  {
    'list': ['isAuthenticated', 'hasRestaurantPermission'],
    'create': ['isAuthenticated', 'hasRestaurantPermission'],
    'link': ['isAuthenticated', 'hasTablePermission'],
    'delete': ['isAuthenticated', 'hasTablePermission'],
    'book': ['isAuthenticated', 'hasTablePermission'],
    'cancelBook': ['isAuthenticated', 'hasTablePermission'],
    'removeLink': ['isAuthenticated', 'hasTablePermission'],
    'reset': ['isAuthenticated', 'hasTablePermission'],
    'modifyOrder': ['isAuthenticated', 'hasTablePermission'],
    'newOrder': false,
    'listOrder': 'isLinkedTabletOfRestaurant',
    'validateToken': 'isLinkedTabletOfRestaurant',

    'deleteAll': true // test only
  },

  'Request':
  {
    'create': 'isLinkedTabletOfRestaurant',
    'list': ['isAuthenticated', 'hasRestaurantPermission'],
    'start': ['isAuthenticated', 'hasRequestPermission'],
    'close': ['isAuthenticated', 'hasRequestPermission'],
    'get': 'isLinkedTabletOfRestaurant',
    'deleteAll': true // test only
  },

  'MenuItem':
  {
    '*': ['isAuthenticated', 'hasRestaurantPermission']
  },

  'Waiter':
  {
    'create': ['isAuthenticated', 'hasRestaurantPermission'],
    'update': ['isAuthenticated', 'hasRestaurantPermission'],
    'delete': ['isAuthenticated', 'hasRestaurantPermission']
  }

  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
