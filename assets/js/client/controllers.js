angular
  .module('rcs')
  .controller('pageCtrl', ['$rootScope', '$scope', '$state', '$materialSidenav', '$materialToast', 'rcsSession', pageCtrl])
  .controller('signInCtrl', ['$scope', '$state', 'rcsHttp', 'rcsSession', 'ERROR_MESSAGE', signInCtrl])
  .controller('listRestaurantCtrl', ['$scope', '$state', 'rcsHttp', 'rcsSession', listRestaurantCtrl])
  .controller('newRestaurantCtrl', ['$scope', '$state', 'rcsHttp', 'rcsSession', newRestaurantCtrl])
  .controller('monitorCtrl', ['$scope', '$state', 'rcsSession', monitorCtrl])
  .controller('monitorTableCtrl', ['$scope', monitorTableCtrl])
  .controller('monitorRequestCtrl', ['$rootScope', '$scope', 'rcsSession', 'RCS_EVENT', monitorRequestCtrl])
  .controller('authorMenuCtrl', ['$scope', '$timeout', '$materialDialog', 'rcsHttp', authorMenuCtrl])
  .controller('assignAdminCtrl', ['$scope', '$materialDialog', 'rcsHttp', assignAdminCtrl]);

// controllers
function pageCtrl($rootScope, $scope, $state, $materialSidenav, $materialToast, rcsSession) {
  // this is the 'root' of all the app ctrls
  // scope fields
  $scope.navEntries = $state.current.parent.children;

  // scope methods
  $scope.getCurrentUser = getCurrentUser;
  $scope.getCurrentRestaurant = getCurrentRestaurant;
  $scope.clickToggleNav = clickToggleNav;
  $scope.clickSignOut = clickSignOut;
  $scope.clickSelectRestaurant = clickSelectRestaurant;
  $scope.clickUser = clickUser;
  $scope.ifSignedIn = ifSignedIn;
  $scope.ifSelectedRestaurant = ifSelectedRestaurant;
  $scope.ifCanNav = ifCanNav;
  $scope.simpleToast = simpleToast;

  // events
  $rootScope.$on('$stateChangeSuccess', updateNavEntries);

  // defines
  function getCurrentUser () {
    if (!$scope.ifSignedIn()) {
      return null;
    }

    return rcsSession.getSignedInUser().Email;
  }

  function getCurrentRestaurant () {
    if (!$scope.ifSelectedRestaurant()) {
      return null;
    }

    return rcsSession.getSelectedRestaurant().RestaurantName;
  }

  function clickToggleNav () {
    $materialSidenav('left').toggle();
  }

  function clickSignOut () {
    rcsSession.signOut(function () {
      $state.go('page.signin');
    });
  }

  function clickSelectRestaurant () {
    rcsSession.unselectRestaurant(function () {
      $state.go('page.restaurant.list');
    });
  }

  function clickUser () {
    $state.go('page.signin');
  }

  function ifSignedIn () {
    return rcsSession.getSignedInUser() != null;
  }

  function ifSelectedRestaurant () {
    return rcsSession.getSelectedRestaurant() != null;
  }

  function ifCanNav (navEntry) {
    if (navEntry.abscract) {
      return false;
    }

    if (navEntry.data && navEntry.data.authorization) {
      return rcsSession.ifSignedInUserAuthorized(navEntry.data.authorization)
    } else {
      return true;
    }
  }

  function updateNavEntries () {
    $scope.navEntries = $state.current.parent.children;
  }

  function simpleToast (content, duration) {
    if (!duration) {
      var duration = 1000;
    }

    $materialToast({
      template: '<material-toast class="rcs">' + content + '</material-toast>',
      duration: duration,
      position: 'buttom right'
    });
  }
}

function signInCtrl ($scope, $state, rcsHttp, rcsSession, ERROR_MESSAGE) {
  // scope fields
  $scope.signUpShown = false;
  $scope.selectedIndex = 0;
  $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '' };
  $scope.signIn = { email: '', pwd: '' };

  // scope methods
  $scope.onTabSelected = onTabSelected;
  $scope.ifSignedIn = ifSignedIn;
  $scope.getSignedInUser = getSignedInUser;
  $scope.getSignedInUserRoleText = getSignedInUserRoleText;
  $scope.clickSignOut = clickSignOut;
  $scope.clickGoToRestaurants = clickGoToRestaurants;
  $scope.clickShowSignUp = clickShowSignUp;
  $scope.clickSignIn = clickSignIn;
  $scope.clickSignUp = clickSignUp;
  $scope.clickCloseSignUp = closeSignUp;

  // defines
  function onTabSelected () {
    $scope.selectedIndex = this.$index;
  }

  function ifSignedIn () {
    return rcsSession.getSignedInUser() != null;
  }

  function getSignedInUser () {
    return rcsSession.getSignedInUser();
  }

  function getSignedInUserRoleText () {
    if (!ifSignedIn) {
      return null;
    }

    switch (getSignedInUser().Role) {
      case 'admin':
        return '餐厅管理员';
      case 'manager':
        return '餐厅经理';
    }
  }

  function clickSignOut () {
    rcsSession.signOut();
  }

  function clickGoToRestaurants () {
    $state.go('page.restaurant.list');
  }

  function clickShowSignUp () {
    $scope.signUpShown = true;
  }

  function clickSignIn () {
    rcsSession.signIn(
      $scope.signIn.email,
      $scope.signIn.pwd,
      function () {
        $state.go('page.restaurant.list');
      },
      function () {
        alert('login failed');
      });
  }

  function clickSignUp () {
    var info = $scope.signUp;
    info.role = (['admin', 'manager'])[$scope.selectedIndex];

    if (info.pwd !== info.pwdConfirm) {
      return alert(ERROR_MESSAGE.passwordMismatch);
    }

    rcsHttp.User.create(info.email, info.pwd, info.role, info.key)
      .success(function () {
        $scope.signIn.email = info.email;
        $scope.signIn.pwd = info.pwd;
        closeSignUp();
        $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '' };
      })
  }

  function closeSignUp () {
    $scope.signUpShown = false;
    $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '' };
  }
}

function listRestaurantCtrl ($scope, $state, rcsHttp, rcsSession) {
  // scope fields
  $scope.selectedIndex = -1;
  $scope.restaurants = null;

  // scope methods
  $scope.clickRestaurant = clickRestaurant;
  $scope.clickGoTo = clickGoTo;

  // initialize
  if (!rcsSession.getSignedInUser()) {
    return $state.go('page.signin');
  }

  initializeRestaurants();

  // defines
  function initializeRestaurants () {
    return rcsHttp.Restaurant.list()
      .success(function (res) {
        $scope.restaurants = res.Restaurants;
      });
  }

  function clickRestaurant (index) {
    $scope.selectedIndex = index;
  }

  function clickGoTo () {
    rcsSession.selectRestaurant($scope.restaurants[$scope.selectedIndex],
      function success () {
        $state.go('page.management.monitor');
      });
  }
}

function newRestaurantCtrl($scope, $state, rcsHttp, rcsSession) {
  // scope fields
  $scope.name = '';
  $scope.description = '';
  $scope.admins = [];
  $scope.newAdmin = '';

  // scope methods
  $scope.ifDisableCreate = ifDisableCreate;
  $scope.ifDisableAddAdmin = ifDisableAddAdmin;
  $scope.clickCreate = clickCreate;
  $scope.clickDeleteAdmin = clickDeleteAdmin;
  $scope.clickAddAdmin = clickAddAdmin;

  // initialize
  if (!rcsSession.getSignedInUser()) {
    return $state.go('page.signin');
  }

  // defines
  function ifDisableCreate () {
    return !$scope.name;
  }

  function ifDisableAddAdmin () {
    return !$scope.newAdmin || $scope.admins.indexOf($scope.newAdmin) != -1;
  }

  function clickCreate () {
    rcsHttp.Restaurant.create($scope.name, $scope.description, $scope.admins)
      .success(function () {
        $scope.simpleToast('餐厅创建成功: <b>' + $scope.name + '</b>', 3000);
        $state.go('page.restaurant.list');
      })
      .error(function (data) {
        alert(data || 'request failed');
      })
  }

  function clickDeleteAdmin (index) {
    $scope.admins.splice(index, 1);
  }

  function clickAddAdmin () {
    if (!$scope.newAdmin) {
      return;
    }

    if (ifDisableAddAdmin()) {
      return alert('无法重复添加用户:' + $scope.newAdmin);
    }

    $scope.admins.push($scope.newAdmin);
    $scope.newAdmin = '';
  }
}

function monitorCtrl ($scope, $state, rcsSession) {
  // scope methods
  $scope.safeApply = safeApply;

  // initialize
  if (!rcsSession.getSelectedRestaurant()) {
    return $state.go('page.restaurant.list');
  }

  // defines
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
  // scope feilds
  $scope.maxTableRow = 10;
  $scope.maxTableCol = 10;
  $scope.editingTable = false;
  $scope.tableRows = initializeTables();

  // scope method
  $scope.clickToggleEditting = clickToggleEditting;

  // defines
  function initializeTables () {
    var tableRows = new Array($scope.maxTableRow);
    for (var i = 0; i < $scope.maxTableRow; i++) {
      tableRows[i] = new Array($scope.maxTableCol);
      for (var j = 0; j < $scope.maxTableCol; j++) {
       tableRows[i][j] = 'null';
      }
    }

    return tableRows;
  }

  function clickToggleEditting () {
    $scope.editingTable = !$scope.editingTable;
  }
}

function monitorRequestCtrl ($rootScope, $scope, rcsSession, RCS_EVENT) {
  // scope fields
  $scope.selectedIndex = 0;
  $scope.requests = null;

  // scope method
  $scope.ifHasActiveRequest = ifHasActiveRequest;
  $scope.ifUnclosed = ifUnclosed;
  $scope.ifClosed = ifClosed;

  // events
  $rootScope.$on(RCS_EVENT.requestsUpdate, initializeRequests)

  // initialize
  initializeRequests();

  // defines
  function initializeRequests () {
    $scope.requests = rcsSession.getRequests();
    $scope.safeApply();
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

function authorMenuCtrl($scope, $timeout, $materialDialog, rcsHttp) {
  // scope fields
  $scope.selectedIndex = 0;
  $scope.menuTypes = null;
  $scope.newType = '';
  $scope.menuItems = null;
  $scope.newMenuItem = null;

  // scope methods
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

  // locals
  var master = {menuItems: []};

  // initialize
  initializeMenu();
  clickResetNewItem();

  // defines
  function initializeMenu () {
    // >>> mock
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

    // <<< mock
    $scope.menuItems = menu;
    $scope.menuTypes = [];

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
      templateUrl: 'template/dialog-deleteTemplate',
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

function assignAdminCtrl($scope, $materialDialog, rcsHttp) {
  // scope fields
  $scope.adminRows = null;
  $scope.newAdmin = '';

  // scope methods
  $scope.ifDisableAddAdmin = ifDisableAddAdmin;
  $scope.clickRemoveAdmin = clickRemoveAdmin;
  $scope.clickAddAdmin = clickAddAdmin;

  // locals
  var admins = [];
  var getAdminRows = getAdminRows;

  // initialize
  initializeAdmins();

  // defines
  function initializeAdmins () {
    /// >>> mock
    for (var i = 10 - 1; i >= 0; i--) {
      admins.push({Email: 'admin' + i});
    }
    /// <<< mock

    $scope.adminRows = getAdminRows();
  }

  function getAdminRows () {
    var adminRows = [];
    var row = 0;
    var rowItemLimit = 4;
    var rowItemCount = 0;

    for (var i = admins.length - 1; i >= 0; i--) {
      if (!adminRows[row]) {
        adminRows[row] = [];
      }

      adminRows[row].push(admins[i]);
      if (++rowItemCount == rowItemLimit) {
        row++;
        rowItemCount = 0;
      }
    };

    return adminRows;
  }

  function ifDisableAddAdmin () {
    if (!$scope.newAdmin) {
      return true;
    }

    for (var i = admins.length - 1; i >= 0; i--) {
      if (admins[i].Email == $scope.newAdmin) {
        return true;
      }
    }

    return false;
  }

  function clickRemoveAdmin (admin, event) {
    var assignAdminScope = $scope;

    var dialogDelete = {
      templateUrl: 'template/dialog-deleteTemplate',
      targetEvent: event,
      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
        $scope.deleteFrom = '管理员';
        $scope.deleteItem = admin.Email;
        $scope.clickDelete = clickDelete;
        $scope.clickCancel = clickCancel;

        function clickDelete () {
          // >>> mock
          $hideDialog();
          admins.splice(admins.indexOf(admin), 1);
          assignAdminScope.adminRows = getAdminRows();
          return;
          // <<< mock

          rcsAPI.Restaurant.removeAdmin(
            $scope.restaurantId,
            admin.Email
          )
          .success(function () {
            $hideDialog();
            admins.splice(admins.indexOf(admin), 1);
            assignAdminScope.adminRows = getAdminRows();
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

  function clickAddAdmin () {
    if (!$scope.newAdmin) {
      return;
    }

    if (ifDisableAddAdmin()) {
      return alert('无法重复添加用户:' + $scope.newAdmin);
    }

    /// >>> mock
    var newAdmin = {Email: $scope.newAdmin};
    /// <<< mock

    admins.push(newAdmin);
    $scope.adminRows = getAdminRows();
    $scope.newAdmin = '';
  }
}