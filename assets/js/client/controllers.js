angular
  .module('rcs')
  .controller('pageCtrl', ['$rootScope', '$scope', '$state', '$materialSidenav', pageCtrl])
  .controller('signInCtrl', ['$scope', '$state', '$log', 'rcsAPI', 'rcsAuth', 'ERROR_MESSAGE', signInCtrl])
  .controller('listRestaurantCtrl', ['$scope', '$state', listRestaurantCtrl])
  .controller('newRestaurantCtrl', ['$scope', newRestaurantCtrl])
  .controller('monitorCtrl', ['$scope', monitorCtrl])
  .controller('authorMenuCtrl', ['$scope', authorMenuCtrl])
  .controller('assignAdminCtrl', ['$scope', assignAdminCtrl]);

// controllers
function pageCtrl($rootScope, $scope, $state, $materialSidenav) {
  // as home is an abstract state, the current state will be one child of it
  $scope.currentUser = 'Shuyu Cao';
  $scope.currentRestaurant = 'KFC-fake';
  $scope.clickToggleNav = toggleNav;
  // $scope.clickCloseNav = closeNav;
  $scope.clickSignOut = signOut;
  $scope.clickSelectRestaurant = selectRestaurant;
  $scope.canNav = canNav;

  updateNavEntries();
  $rootScope.$on('$stateChangeSuccess', updateNavEntries);

  function toggleNav () {
    $materialSidenav('left').toggle();
  }

  // function closeNav () {
  //   $materialSidenav('left').close();
  // }

  function signOut () {
    // TODO: real sign out
    $state.go('page.signin');
  }

  function selectRestaurant () {
    $state.go('page.restaurant.list');
  }

  function canNav (navEntry) {
    return !navEntry.abscract;
  }

  function updateNavEntries () {
    $scope.navEntries = $state.current.parent.children;
  }
}

function signInCtrl ($scope, $state, $log, rcsAPI, rcsAuth, ERROR_MESSAGE) {
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
      $state.go('page.restaurant.list');
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

function listRestaurantCtrl ($scope, $state) {
  $scope.selectedIndex = -1;
  $scope.restaurants = [{
    name: 'KFC-fake', description: 'this is a test'
  }, {
    name: 'KFC-fake2', description: 'this is another test'
  }]
  $scope.clickSelectRestaurant = selectRestaurant;
  $scope.clickGoNext = goNext;

  function selectRestaurant (index) {
    $scope.selectedIndex = index;
  }

  function goNext () {
    // TODO: add real logic
    $state.go('page.management.monitor');
  }
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