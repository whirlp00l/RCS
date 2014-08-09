angular
  .module('rcs')
  .controller('signupCtrl', ['$scope', '$state', 'rcsAPI', 'ERROR_MESSAGE',
    function ($scope, $state, rcsAPI, ERROR_MESSAGE) {

      $scope.roles = [
        {name: '管理员', value: 'admin'},
        {name: '餐厅经理', value: 'manager'}
      ];

      $scope.info = {
        selectedRole: $scope.roles[0].value
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