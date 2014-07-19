angular
  .module('rcs')
  .controller('signupCtrl', ['$scope', '$state', 'rcsAPI', 'ERROR_MESSAGE',
    function ($scope, $state, rcsAPI, ERROR_MESSAGE) {
      console.log('signupCtrl');

      $scope.role = {
        admin: 'admin',
        manager: 'manager'
      }

      $scope.info = {
        selectedRole: $scope.role.admin
      }

      $scope.signup = function (email, pwd, pwdConfirm, role, key) {
        if (pwd !== pwdConfirm) {
          return alert(ERROR_MESSAGE.passwordMismatch);
        }

        rcsAPI.User.create(email, pwd, role, key)
          .success(function () {
            $state.go('login');
          })
      }
    }]);