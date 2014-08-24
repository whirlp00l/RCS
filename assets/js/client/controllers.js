angular
  .module('rcs')
  .controller('homeCtrl', ['$scope', '$materialSidenav', homeCtrl])
  .controller('userCtrl', ['$scope', '$log', 'rcsAPI', 'rcsAuth', 'ERROR_MESSAGE', userCtrl]);

function homeCtrl($scope, $materialSidenav) {
  $scope.toggleSidenav = function() {
    $materialSidenav('left').toggle();
  };

  $scope.closeSidenav = function() {
    $materialSidenav('left').close();
  };
}

function userCtrl ($scope, $log, rcsAPI, rcsAuth, ERROR_MESSAGE) {
  $scope.signUpShown = false;
  $scope.selectedIndex = 0;
  $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '' };
  $scope.signIn = {email: '', pwd: ''};

  $scope.showSignUp = showSignUp;
  $scope.clickSignIn = clickSignIn;
  $scope.clickSignUp = clickSignUp;

  function showSignUp (argument) {
    $scope.signUpShown = true;
  }

  function clickSignIn () {
    rcsAuth.login({
      email: $scope.signIn.email,
      password: $scope.signIn.pwd
    })
    .success(function () {
      alert('login succeeded')
      // $state.go('restaurant');
    })
    .error(function () {
      alert('login failed')
    });
  };

  function clickSignUp () {
    var info = $scope.signUp;
    info.role = (['admin', 'manager'])[$scope.selectedIndex];

    if (info.pwd !== info.pwdConfirm) {
      return alert(ERROR_MESSAGE.passwordMismatch);
    }

    rcsAPI.User.create(info.email, info.pwd, info.role, info.key)
      .success(function () {
        $scope.signIn.email = info.email;
        $scope.signIn.pwd = info.pwd;
        $scope.signUpShown = false;
        $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '' };
      })
  };
}