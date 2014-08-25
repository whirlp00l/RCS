angular
  .module('rcs')
  .controller('layoutCtrl', ['$scope', '$state', '$materialSidenav', layoutCtrl])
  .controller('signInCtrl', ['$scope', '$log', 'rcsAPI', 'rcsAuth', 'ERROR_MESSAGE', signInCtrl])
  .controller('listRestaurantCtrl', ['$scope', listRestaurantCtrl])
  .controller('newRestaurantCtrl', ['$scope', newRestaurantCtrl])
  .controller('monitorCtrl', ['$scope', monitorCtrl])
  .controller('authorMenuCtrl', ['$scope', authorMenuCtrl])
  .controller('assignAdminCtrl', ['$scope', assignAdminCtrl]);

// controllers
function layoutCtrl($scope, $state, $materialSidenav) {
  // as home is an abstract state, the current state will be one child of it
  $scope.navEntries = $state.current.parent.children;
  $scope.currentUser = 'Shuyu Cao';
  $scope.currentRestaurant = 'KFC-fake';
  $scope.clickToggleNav = toggleNav;
  $scope.clickCloseNav = closeNav;
  $scope.clickSignOut = signOut;
  $scope.clickSelectRestaurant = selectRestaurant;

  function toggleNav () {
    $materialSidenav('left').toggle();
  }

  function closeNav () {
    $materialSidenav('left').close();
  }

  function signOut () {
    // TODO: real sign out
    $state.go('home.signin');
  }

  function selectRestaurant () {
    $state.go('restaurant.list');
  }
}

function signInCtrl ($scope, $log, rcsAPI, rcsAuth, ERROR_MESSAGE) {
  $scope.signUpShown = false;
  $scope.selectedIndex = 0;
  $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '' };
  $scope.signIn = {email: '', pwd: ''};

  $scope.showSignUp = showSignUp;
  $scope.clickSignIn = clickSignIn;
  $scope.clickSignUp = clickSignUp;
  $scope.clickCloseSignUp = closeSignUp;

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
  }

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
        closeSignUp();
      })
  }

  function closeSignUp () {
    $scope.signUpShown = false;
    $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '' };
  }
}

function listRestaurantCtrl (argument) {
  // body...
}

function newRestaurantCtrl($scope) {
  // body...
}

function monitorCtrl($scope) {
  // body...
}

function authorMenuCtrl($scope) {
  // body...
}

function assignAdminCtrl($scope) {
  // body...
}