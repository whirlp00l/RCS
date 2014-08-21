angular
  .module('rcs')
  .service('SessionService', function () {
    this.create = function (user, userRole) {
      // this.id = sessionId;
      this.user = user;
      this.userRole = userRole;
    };

    this.destroy = function () {
      // this.id = null;
      this.user = null;
      this.userRole = null;
    };

    return this;
  });