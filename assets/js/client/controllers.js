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
  $scope.clickGoTo = goTo;

  function selectRestaurant (index) {
    $scope.selectedIndex = index;
  }

  function goTo () {
    // session service: restaurant changed
    $state.go('page.management.monitor');
  }
}

function newRestaurantCtrl($scope) {
  $scope.name = '';
  $scope.description = '';
  $scope.admins = [];
  $scope.newAdmin = '';

  $scope.ifDisableCreate = ifDisableCreate;
  $scope.ifDisableAddAdmin = ifDisableAddAdmin;
  $scope.clickCreate = create;
  $scope.clickDeleteAdmin = deleteAdmin;
  $scope.clickAddAdmin = addAdmin;

  function ifDisableCreate () {
    return !$scope.name;
  }

  function create () {
    alert('create');
  }

  function deleteAdmin (index) {
    $scope.admins.splice(index, 1);
  }

  function ifDisableAddAdmin () {
    return !$scope.newAdmin;
  }

  function addAdmin () {
    if (!$scope.newAdmin) {
      return;
    }

    if ($scope.admins.indexOf($scope.newAdmin) != -1) {
      return alert('无法重复添加用户:' + $scope.newAdmin);
    }

    $scope.admins.push($scope.newAdmin);
    $scope.newAdmin = '';
  }
}

function monitorCtrl($scope) {
  $scope.maxTableRow = 10;
  $scope.maxTableCol = 10;

  $scope.editingTable = false;
  $scope.tables = initializeTables();
  $scope.requests = initializeRequests();

  $scope.clickToggleEditting = clickToggleEditting;

  function initializeTables () {
    var tables = new Array($scope.maxTableRow);
    for (var i = 0; i < $scope.maxTableRow; i++) {
      tables[i] = new Array($scope.maxTableCol);
      for (var j = 0; j < $scope.maxTableCol; j++) {
       tables[i][j] = 'null';
      }
    }

    tables[0][0] = {
      TableName: 'A4',
      TableType: 'A',
      Status: 'empty',
      ActiveRequestCount: 0
    };

    tables[0][1] = {
      TableName: 'A5',
      TableType: 'A',
      Status: 'ordering',
      ActiveRequestCount: 0
    };

    tables[0][3] = {
      TableName: 'A6',
      TableType: 'A',
      Status: 'empty',
      ActiveRequestCount: 0
    };

    tables[0][7] = {
      TableName: 'A7',
      TableType: 'A',
      Status: 'paid',
      ActiveRequestCount: 0
    };

    tables[0][9] = {
      TableName: 'A9',
      TableType: 'A',
      Status: 'empty',
      ActiveRequestCount: 0
    };

    tables[1][9] = {
      TableName: 'A8',
      TableType: 'A',
      Status: 'empty',
      ActiveRequestCount: 0
    };

    tables[2][7] = {
      TableName: 'A10',
      TableType: 'A',
      Status: 'empty',
      ActiveRequestCount: 0
    };

    tables[2][3] = {
      id: 1,
      TableName: 'A1',
      TableType: 'A',
      Status: 'empty',
      MapRow: 2,
      MapCol: 3,
      ActiveRequestCount: 0
    };

    tables[5][2] = {
      id: 2,
      TableName: 'A2',
      TableType: 'A',
      Status: 'paying',
      MapRow: 5,
      MapCol: 2,
      ActiveRequestCount: 1
    };

    tables[5][1] = {
      id: 3,
      TableName: 'A3',
      TableType: 'A',
      Status: 'paid',
      MapRow: 5,
      MapCol: 1,
      ActiveRequestCount: 2
    };

    tables[9][9] = {
      TableName: 'C1',
      TableType: 'C',
      Status: 'empty',
      ActiveRequestCount: 0
    };

    tables[9][0] = {
      TableName: 'C2',
      TableType: 'C',
      Status: 'empty',
      ActiveRequestCount: 0
    };

    return tables;
  }

  function initializeRequests () {
    var requests = [{
      id: 1,
      Type: 'call',
      Table: {
        TableName: 'A1',
      }
    }, {
      id: 2,
      Type: 'pay',
      Table: {
        TableName: 'B1',
      }
    }, {
      id: 3,
      Type: 'order',
      Table: {
        TableName: 'B2',
      }
    }];

    return requests;
  }

  function clickToggleEditting () {
    $scope.editingTable = !$scope.editingTable;
  }
}

function authorMenuCtrl($scope) {
  // body...
}

function assignAdminCtrl($scope) {
  // body...
}