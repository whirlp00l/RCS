/**
 * WaiterController
 *
 * @description :: Server-side logic for managing Waiters
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function (req, res) {
    var restaurantId = req.body.RestaurantId;
    var name = req.body.Name;

    if (!name) {
      return res.badRequest('Missing required fields.');
    }

    Waiter.findOne({
      Name: name,
      Restaurant: restaurantId
    }).exec(function (err, existingWaiter) {
      if (err) {
        return res.serverError(err);
      }

      if (existingWaiter) {
        return res.badRequest('Waiter name [' + existingWaiter.Name + '] already exists');
      }

      Waiter.create({
        Name: name,
        Restaurant: restaurantId
      }).exec(function (err, waiter) {
        if (err) {
          return res.serverError(err);
        }

        Restaurant.message(restaurantId, {newWaiter: waiter});

        return res.json({Waiter: waiter});
      })
    });
  },

  update: function (req, res) {
    var restaurantId = req.body.RestaurantId;
    var waiterId = req.param('id');
    var online = req.body.Online;
    var busy = req.body.Busy;

    if (!waiterId) {
      return res.badRequest('Missing required fields.');
    }

    Waiter.findOne({
      Restaurant: restaurantId,
      id: waiterId
    }).exec(function (err, waiter) {
      if (err) {
        return res.serverError(err);
      }

      if (!waiter) {
        return res.badRequest('Waiter id [' + waiterId + '] is invalid');
      }

      if (typeof online != 'undefined') {
        waiter.Online = online;
      }

      if (typeof busy != 'undefined') {
        waiter.Busy = busy;
      }

      if (waiter.Online == false) {
        waiter.Busy = false;
      }

      waiter.save(function (err, watier) {
        if (err) {
          return res.serverError(err);
        }

        Restaurant.message(restaurantId, {setWaiter: watier});

        return res.json({Waiter: waiter})
      })
    });
  },

  delete: function (req, res) {
    var restaurantId = req.body.RestaurantId;
    var waiterId = req.param('id');

    if (!waiterId) {
      return res.badRequest('Missing required fields.');
    }

    Waiter.findOne({
      Restaurant: restaurantId,
      id: waiterId
    }).exec(function (err, waiter) {
      if (err) {
        return res.serverError(err);
      }

      if (!waiter) {
        return res.badRequest('Waiter id [' + waiterId + '] is invalid');
      }

      waiter.destroy(function (err) {
        if (err) {
          return res.serverError(err);
        }

        Restaurant.message(restaurantId, {removeWaiterId: waiter.id});

        return res.json({Waiter: {id: waiter.id}});
      })
    });
  }

};

