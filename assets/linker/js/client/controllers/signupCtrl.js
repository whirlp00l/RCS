angular
  .module('rcs')
  .controller('signupCtrl', ['$scope', '$state', 'rcsAPI', 'ERROR_MESSAGE',
    function ($scope, $state, rcsAPI, ERROR_MESSAGE) {
      console.log('signupCtrl');

      $scope.role = {
        admin: 'admin',
        manager: 'manager'
      }

      $scope.selectedRole = $scope.role.admin;

      $scope.signup = function (email, pwd, pwdConfirm, role) {
        if (pwd !== pwdConfirm) {
          return alert(ERROR_MESSAGE.passwordMismatch);
        }

        return rcsAPI.User.create(email, pwd, role)
          .success(function () {
            return $state.go('login');
          })
      }
    }]);