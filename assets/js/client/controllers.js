angular
  .module('rcs')
  .controller('pageCtrl', ['$rootScope', '$scope', '$state', '$materialSidenav', pageCtrl])
  .controller('signInCtrl', ['$scope', '$state', '$log', 'rcsAPI', 'rcsAuth', 'ERROR_MESSAGE', signInCtrl])
  .controller('listRestaurantCtrl', ['$scope', '$state', listRestaurantCtrl])
  .controller('newRestaurantCtrl', ['$scope', newRestaurantCtrl])
  .controller('monitorCtrl', ['$scope', '$materialToast', monitorCtrl])
  .controller('monitorTableCtrl', ['$scope', monitorTableCtrl])
  .controller('monitorRequestCtrl', ['$scope', monitorRequestCtrl])
  .controller('authorMenuCtrl', ['$scope', '$timeout', '$materialDialog', authorMenuCtrl])
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

function monitorCtrl ($scope, $materialToast) {
  $scope.simpleToast = simpleToast;
  $scope.safeApply = safeApply;

  function simpleToast (content) {
    $materialToast({
      template: '<material-toast class="rcs">' + content + '</material-toast>',
      duration: 1000,
      position: 'buttom right'
    });
  }

  function safeApply (fn) {
      try {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
          if(fn && (typeof(fn) === 'function')) {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      }
      catch (err) {

      }
    }
}

function monitorTableCtrl($scope) {
  $scope.maxTableRow = 10;
  $scope.maxTableCol = 10;

  $scope.editingTable = false;
  $scope.tables = initializeTables();

  $scope.clickToggleEditting = clickToggleEditting;

  function initializeTables () {
    var tables = new Array($scope.maxTableRow);
    for (var i = 0; i < $scope.maxTableRow; i++) {
      tables[i] = new Array($scope.maxTableCol);
      for (var j = 0; j < $scope.maxTableCol; j++) {
       tables[i][j] = 'null';
      }
    }

    tables[2][3] = {
      id: 1,
      TableName: 'A1',
      TableType: 'A',
      Status: 'empty',
      MapRow: 2,
      MapCol: 3,
      ActiveRequestCount: 0
    };

    tables[2][4] = {
      id: 2,
      TableName: 'A2',
      TableType: 'A',
      Status: 'paying',
      MapRow: 2,
      MapCol: 4,
      ActiveRequestCount: 1
    };

    tables[2][5] = {
      id: 3,
      TableName: 'A3',
      TableType: 'A',
      Status: 'paid',
      MapRow: 2,
      MapCol: 5,
      BookName: 'Shuyu',
      BookDateTime: new Date(),
      ActiveRequestCount: 2
    };

    return tables;
  }

  function clickToggleEditting () {
    $scope.editingTable = !$scope.editingTable;
  }
}

function monitorRequestCtrl ($scope) {
  $scope.selectedIndex = 0;
  $scope.requests = initializeRequests();

  $scope.ifHasActiveRequest = ifHasActiveRequest;
  $scope.ifUnclosed = ifUnclosed;
  $scope.ifClosed = ifClosed;

  function initializeRequests () {
    var requests = [{
      Type: 'call',
      Status: 'new',
      Importance: 0,
      createdAt: new Date(),
      ClosedAt: new Date(),
      PayType: null,
      PayAmount: null,
      OrderItems: null,
      Table: {
        TableName: 'A3'
      }
    }, {
      Type: 'pay',
      Status: 'inProgress',
      Importance: 1,
      createdAt: new Date(),
      ClosedAt: new Date(),
      PayType: 'cash',
      PayAmount: 100,
      OrderItems: null,
      Table: {
        TableName: 'A2'
      }
    }, {
      Type: 'order',
      Status: 'new',
      Importance: 0,
      createdAt: new Date(),
      ClosedAt: new Date(),
      PayType: null,
      PayAmount: null,
      OrderItems: [1, 1, 1],
      Table: {
        TableName: 'A2'
      }
    }, {
      Type: 'order',
      Status: 'closed',
      Importance: 0,
      createdAt: new Date(),
      ClosedAt: new Date(),
      PayType: null,
      PayAmount: null,
      OrderItems: [1, 1, 1],
      Table: {
        TableName: 'A2'
      }
    }];

    return requests;
  }

  function ifHasActiveRequest () {
    var requests = $scope.requests;
    for (var i = requests.length - 1; i >= 0; i--) {
      if ($scope.ifUnclosed(requests[i])) {
        return true;
      }
    }

    return false;
  }

  function ifClosed (request) {
    return request.Status == "closed";
  }

  function ifUnclosed (request) {
    return !$scope.ifClosed(request);
  }

}

function authorMenuCtrl($scope, $timeout, $materialDialog) {
  $scope.selectedIndex = 0;
  $scope.menuTypes = [];
  $scope.newType = '';
  $scope.menuItems = [];
  $scope.newMenuItem = null;

  $scope.onTabSelected = onTabSelected;
  $scope.ifValidNewType = ifValidNewType;
  $scope.ifValidItem = ifValidItem;
  $scope.ifDirty = ifDirty;
  $scope.clickDiscardChange = clickDiscardChange;
  $scope.clickNewType = clickNewType;
  $scope.clickUpdateItem = clickUpdateItem;
  $scope.clickDeleteItem = clickDeleteItem;
  $scope.clickNewItem = clickNewItem;
  $scope.clickResetNewItem = clickResetNewItem;

  var master = {menuItems: []};

  initializeMenu();
  clickResetNewItem();

  function initializeMenu () {
    // >>mock
    var menu = [{
      Name: '米饭',
      Type: '主食',
      Price: 5,
      PremiumPrice: 3
    }, {
      Name: '凉拌青笋',
      Type: '凉菜',
      Price: 15,
      PremiumPrice: 12
    }, {
      Name: '可乐',
      Type: '饮料',
      Price: 10,
      PremiumPrice: 8
    }, {
      Name: '雪碧',
      Type: '饮料',
      Price: 10,
      PremiumPrice: 8
    }, {
      Name: '水煮鱼',
      Type: '热菜',
      Price: 50,
      PremiumPrice: 45
    }]

    // <<mock
    $scope.menuItems = menu;

    for (var i = 0 ; i < menu.length; i++) {
      var type = menu[i].Type;
      if ($scope.menuTypes.indexOf(type) == -1) {
        $scope.menuTypes.push(type);
      }

      master.menuItems.push(angular.copy(menu[i]))
    }
  }

  function clickResetNewItem () {
    $scope.newMenuItem = {
      Name: '',
      Type: $scope.menuTypes[$scope.selectedIndex],
      Price: '',
      PremiumPrice: ''
    };
  }

  function onTabSelected () {
    $scope.selectedIndex = this.$index;
    for (var i = $scope.menuItems.length - 1; i >= 0; i--) {
      $scope.menuItems[i] = angular.copy(master.menuItems[i]);
    };
    $scope.newMenuItem.Type = $scope.menuTypes[$scope.selectedIndex];
  }

  function ifValidNewType () {
    if ($scope.newType == '') {
      return false;
    }

    var i = $scope.menuTypes.indexOf($scope.newType);
    if (i != -1) {
      $scope.selectedIndex = i;
      return false;
    }

    return true;
  }

  function clickNewType () {
    if (!$scope.ifValidNewType()) {
      return;
    }

    $scope.menuTypes.push($scope.newType);
    $scope.newType = '';

    $timeout(function () {
      $scope.selectedIndex = $scope.menuTypes.length - 1;
      $scope.newMenuItem.Type = $scope.menuTypes[$scope.selectedIndex];
    });
  }

  function ifDirty (menuItem) {
    var i = $scope.menuItems.indexOf(menuItem);
    return !angular.equals(menuItem, master.menuItems[i]);
  }

  function clickDiscardChange (menuItem) {
    var i = $scope.menuItems.indexOf(menuItem);
    $scope.menuItems[i] = angular.copy(master.menuItems[i]);
  }

  function clickUpdateItem (menuItem) {
    var i = $scope.menuItems.indexOf(menuItem);

    // >>> mock
    var updatedMenuItem = angular.copy(menuItem);
    $scope.menuItems[i] = updatedMenuItem;
    master.menuItems[i] = angular.copy(updatedMenuItem);
    return;
    // <<< mock

    rcsAPI.MenuItem.update(
      $scope.restaurantId,
      menuItem.id,
      menuItem.Type,
      menuItem.Price,
      menuItem.PremiumPrice == '' ? null : menuItem.PremiumPrice
    )
    .success(function(data) {
      var updatedMenuItem = data.MenuItem;
      $scope.menuItems[i] = updatedMenuItem;
      master.menuItems[i] = angular.copy(updatedMenuItem);
    })
    .error(function (data, status) {
      if (status === 400) {
        alert(data.validationErrors || 400);
      } else {
        alert(status);
      }
    });
  }

  function clickDeleteItem (menuItem, event) {
    var i = $scope.menuItems.indexOf(menuItem);
    var authorMenuScope = $scope;

    var dialogDelete = {
      templateUrl: 'template/dialogDeleteTemplate',
      targetEvent: event,
      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
        $scope.deleteFrom = '菜单';
        $scope.deleteItem = menuItem.Name + '(' + menuItem.Type + ')';
        $scope.clickDelete = clickDelete;
        $scope.clickCancel = clickCancel;

        function clickDelete () {
          // >>> mock
          $hideDialog();
          authorMenuScope.menuItems.splice(i, 1);
          master.menuItems.splice(i, 1);
          return;
          // <<< mock

          rcsAPI.MenuItem.delete(
            menuItem.Restaurant,
            menuItem.id
          )
          .success(function(data) {
            $hideDialog();
            authorMenuScope.menuItems.splice(i, 1);
            master.menuItems.splice(i, 1);
          })
          .error(function (data, status) {
            if (status === 400) {
              alert(data.validationErrors || 400);
            } else {
              alert(status);
            }
          });
        }

        function clickCancel () {
          $hideDialog();
        }
      }]
    };
    $materialDialog(dialogDelete);
  }

  function ifValidItem (menuItem) {
    if (!menuItem || !menuItem.Name || !menuItem.Type || !menuItem.Price) {
      return false;
    }

    menuItem.Price = parseFloat(menuItem.Price);
    if (!angular.isNumber(menuItem.Price) || menuItem.Price < 0) {
      return false;
    }

    if (menuItem.PremiumPrice) {
      menuItem.PremiumPrice = parseFloat(menuItem.PremiumPrice);
      if (!angular.isNumber(menuItem.PremiumPrice) || menuItem.PremiumPrice > menuItem.Price)
      return false;
    }

    return true;
  }

  function clickNewItem () {
    if (!$scope.ifValidItem($scope.newMenuItem)) {
      return;
    }

    /// >>> mock
    var newMenuItem = angular.copy($scope.newMenuItem);
    $scope.menuItems.push(newMenuItem);
    master.menuItems.push(angular.copy(newMenuItem));
    $scope.clickResetNewItem();
    return;
    /// <<< mock

    rcsAPI.MenuItem.create(
      $scope.restaurantId,
      $scope.newMenuItem.Name,
      $scope.newMenuItem.Type,
      $scope.newMenuItem.Price,
      $scope.newMenuItem.PremiumPrice == '' ? null : $scope.newMenuItem.PremiumPrice
    )
    .success(function(data) {
      var newMenuItem = data.MenuItem;
      $scope.menuItems.push(newMenuItem);
      master.menuItems.push(angular.copy(newMenuItem));
      $scope.clickResetNewItem();
    })
    .error(function (data, status) {
      if (status === 400) {
        alert(data.validationErrors || 400);
      } else {
        alert(status);
      }
    });
  }
}

function assignAdminCtrl($scope) {
  // body...
}