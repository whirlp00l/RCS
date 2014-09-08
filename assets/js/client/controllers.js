angular
  .module('rcs')
  .controller('pageCtrl', ['$rootScope', '$scope', '$state', '$materialSidenav', '$materialToast', 'rcsSession', pageCtrl])
  .controller('signInCtrl', ['$scope', '$state', 'rcsHttp', 'rcsSession', 'ERROR_MESSAGE', signInCtrl])
  .controller('listRestaurantCtrl', ['$scope', '$state', 'rcsHttp', 'rcsSession', listRestaurantCtrl])
  .controller('newRestaurantCtrl', ['$scope', '$state', 'rcsHttp', 'rcsSession', newRestaurantCtrl])
  .controller('monitorCtrl', ['$rootScope', '$scope', '$state', 'rcsSession', 'RCS_EVENT', monitorCtrl])
  .controller('monitorTableCtrl', ['$scope', 'rcsSession', monitorTableCtrl])
  .controller('monitorRequestCtrl', ['$rootScope', '$scope', 'rcsSession', 'RCS_EVENT', monitorRequestCtrl])
  .controller('authorMenuCtrl', ['$scope', '$state', '$timeout', '$materialDialog', 'rcsHttp', 'rcsSession', authorMenuCtrl])
  .controller('assignAdminCtrl', ['$scope', '$state', '$materialDialog', 'rcsHttp', 'rcsSession', assignAdminCtrl]);

// controllers
function pageCtrl($rootScope, $scope, $state, $materialSidenav, $materialToast, rcsSession) {
  // this is the 'root' of all the app ctrls
  // scope fields
  $scope.navEntries = $state.current.parent.children;

  // scope methods
  $scope.clickRestaurant = clickRestaurant;
  $scope.clickSelectRestaurant = clickSelectRestaurant;
  $scope.clickSignOut = clickSignOut;
  $scope.clickToggleNav = clickToggleNav;
  $scope.clickUser = clickUser;
  $scope.getCurrentRestaurant = getCurrentRestaurant;
  $scope.getCurrentUser = getCurrentUser;
  $scope.ifCanNav = ifCanNav;
  $scope.ifSelectedRestaurant = ifSelectedRestaurant;
  $scope.ifSignedIn = ifSignedIn;
  $scope.simpleToast = simpleToast;

  // events
  $rootScope.$on('$stateChangeSuccess', updateNavEntries);

  // defines
  function getCurrentUser () {
    if (!$scope.ifSignedIn()) {
      return null;
    }

    return rcsSession.getSignedInUser();
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
    $state.go('page.restaurant.list');
  }

  function clickUser () {
    $state.go('page.signin');
  }

  function clickRestaurant () {
    $state.go('page.management.monitor');
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
  $scope.selectedIndex = 0;
  $scope.signIn = { email: '', pwd: '' };
  $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '', name: '' };
  $scope.signUpShown = false;

  // scope methods
  $scope.clickCloseSignUp = closeSignUp;
  $scope.clickGoToRestaurants = clickGoToRestaurants;
  $scope.clickShowSignUp = clickShowSignUp;
  $scope.clickSignIn = clickSignIn;
  $scope.clickSignOut = clickSignOut;
  $scope.clickSignUp = clickSignUp;
  $scope.getSignedInUser = getSignedInUser;
  $scope.getSignedInUserRoleText = getSignedInUserRoleText;
  $scope.ifSignedIn = ifSignedIn;
  $scope.onTabSelected = onTabSelected;

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

    if (!info.email) {
      return alert(ERROR_MESSAGE.emailInvalid);
    }

    if (info.pwd !== info.pwdConfirm) {
      return alert(ERROR_MESSAGE.passwordMismatch);
    }

    rcsHttp.User.create(info.email, info.pwd, info.role, info.key, info.name)
      .success(function () {
        $scope.signIn.email = info.email;
        $scope.signIn.pwd = info.pwd;
        closeSignUp();
        $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '', name: '' };
      })
  }

  function closeSignUp () {
    $scope.signUpShown = false;
    $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '' };
  }
}

function listRestaurantCtrl ($scope, $state, rcsHttp, rcsSession) {
  // scope fields
  $scope.restaurants = null;
  $scope.selectedIndex = -1;

  // scope methods
  $scope.clickGoTo = clickGoTo;
  $scope.clickRestaurant = clickRestaurant;

  // initialize
  if (!rcsSession.getSignedInUser()) {
    return $state.go('page.signin');
  }

  rcsSession.unselectRestaurant(function () {
    initializeRestaurants();
  });

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
  $scope.admins = [];
  $scope.description = '';
  $scope.name = '';
  $scope.newAdmin = '';

  // scope methods
  $scope.clickAddAdmin = clickAddAdmin;
  $scope.clickCreate = clickCreate;
  $scope.clickDeleteAdmin = clickDeleteAdmin;
  $scope.ifDisableAddAdmin = ifDisableAddAdmin;
  $scope.ifDisableCreate = ifDisableCreate;

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

function monitorCtrl ($rootScope, $scope, $state, rcsSession, RCS_EVENT) {
  // scope fields
  $scope.loaded = rcsSession.ifSocketReady();

  // scope methods
  $scope.safeApply = safeApply;

  // event
  $rootScope.$on(RCS_EVENT.socketReady, function () {
    $scope.loaded = true;
    $scope.safeApply();
  })

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

function monitorTableCtrl($scope, rcsSession) {
  // scope feilds
  $scope.editingTable = true;
  $scope.maxTableCol = 10;
  $scope.maxTableRow = 10;
  $scope.tableRows = initializeTables();

  // scope method
  $scope.clickToggleEditting = clickToggleEditting;

  // initialize
  // get into edit mode unless there is table
  var tables = rcsSession.getTables();
  for (var row = tables.length - 1; row >= 0; row--) {
    for (var col = tables[row].length - 1; col >= 0; col--) {
      if (tables[row][col]) {
        $scope.editingTable = false;
      }
    }
  }

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
  $scope.requests = null;
  $scope.selectedIndex = 0;

  // scope method
  $scope.ifClosed = ifClosed;
  $scope.ifHasActiveRequest = ifHasActiveRequest;
  $scope.ifUnclosed = ifUnclosed;

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

function authorMenuCtrl($scope, $state, $timeout, $materialDialog, rcsHttp, rcsSession) {
  // scope fields
  $scope.menuItems = null;
  $scope.menuTypes = null;
  $scope.newMenuItem = null;
  $scope.newType = '';
  $scope.selectedIndex = 0;

  // scope methods
  $scope.clickDeleteItem = clickDeleteItem;
  $scope.clickDiscardChange = clickDiscardChange;
  $scope.clickNewItem = clickNewItem;
  $scope.clickNewType = clickNewType;
  $scope.clickResetNewItem = clickResetNewItem;
  $scope.clickUpdateItem = clickUpdateItem;
  $scope.ifBelongToType = ifBelongToType;
  $scope.ifDirty = ifDirty;
  $scope.ifValidItem = ifValidItem;
  $scope.ifValidNewType = ifValidNewType;
  $scope.onTabSelected = onTabSelected;

  // locals
  var master = {menuItems: []};

  // initialize
  if (!rcsSession.getSelectedRestaurant()) {
    return $state.go('page.restaurant.list');
  }

  var restaurantId = rcsSession.getSelectedRestaurant().id;
  initializeMenu();

  // defines
  function initializeMenu () {
    return rcsHttp.Restaurant.listMenu(restaurantId)
      .success(function (res) {
        var menu = res.Menu;

        $scope.menuItems = menu;
        $scope.menuTypes = [];

        for (var i = 0 ; i < menu.length; i++) {
          var type = menu[i].Type;
          if ($scope.menuTypes.indexOf(type) == -1) {
            $scope.menuTypes.push(type);
          }

          master.menuItems.push(angular.copy(menu[i]))
        }

        clickResetNewItem();
      });
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

  function ifBelongToType (menuItem) {
    return menuItem.Type == $scope.menuTypes[$scope.selectedIndex];
  }

  function ifValidNewType () {
    if ($scope.newType == '') {
      return false;
    }

    var i = $scope.menuTypes.indexOf($scope.newType);
    if (i != -1) {
      return false;
    }

    return true;
  }

  function clickNewType () {
    if (!$scope.ifValidNewType()) {
      return;
    }

    // Type info is local only before an actual menu item is added
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
    // var updatedMenuItem = angular.copy(menuItem);
    // $scope.menuItems[i] = updatedMenuItem;
    // master.menuItems[i] = angular.copy(updatedMenuItem);
    // return;
    // <<< mock

    rcsHttp.MenuItem.update(
      menuItem.Restaurant,
      menuItem.id,
      menuItem.Type,
      menuItem.Price,
      menuItem.PremiumPrice == '' ? null : menuItem.PremiumPrice
    )
    .success(function(res) {
      var updatedMenuItem = res.MenuItem;
      $scope.menuItems[i] = updatedMenuItem;
      master.menuItems[i] = angular.copy(updatedMenuItem);
    })
    .error(function (res, status) {
      if (status === 400) {
        alert(res || 400);
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
          // $hideDialog();
          // authorMenuScope.menuItems.splice(i, 1);
          // master.menuItems.splice(i, 1);
          // return;
          // <<< mock

          rcsHttp.MenuItem.delete(
            menuItem.Restaurant,
            menuItem.id
          )
          .success(function(res) {
            $hideDialog();
            authorMenuScope.menuItems.splice(i, 1);
            master.menuItems.splice(i, 1);
          })
          .error(function (res, status) {
            if (status === 400) {
              alert(res || 400);
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
    // var newMenuItem = angular.copy($scope.newMenuItem);
    // $scope.menuItems.push(newMenuItem);
    // master.menuItems.push(angular.copy(newMenuItem));
    // $scope.clickResetNewItem();
    // return;
    /// <<< mock

    var newMenuItem = $scope.newMenuItem;
    return rcsHttp.MenuItem.create(
      restaurantId,
      newMenuItem.Name,
      newMenuItem.Type,
      newMenuItem.Price,
      newMenuItem.PremiumPrice == '' ? null : newMenuItem.PremiumPrice)
    .success(function(res) {
      var createdMenuItem = res.MenuItem;
      $scope.menuItems.push(createdMenuItem);
      master.menuItems.push(angular.copy(createdMenuItem));
      $scope.clickResetNewItem();
    })
    .error(function (res, status) {
      if (status === 400) {
        alert(res || 400);
      } else {
        alert(status);
      }
    });
  }
}

function assignAdminCtrl($scope, $state, $materialDialog, rcsHttp, rcsSession) {
  // scope fields
  $scope.adminRows = null;
  $scope.newAdminEmail = null;

  // scope methods
  $scope.ifDisableAddAdmin = ifDisableAddAdmin;
  $scope.clickRemoveAdmin = clickRemoveAdmin;
  $scope.clickAddAdmin = clickAddAdmin;

  // locals
  var admins = [];
  var getAdminRows = getAdminRows;

  // initialize
  if (!rcsSession.getSelectedRestaurant()) {
    return $state.go('page.restaurant.list');
  }

  var restaurantId = rcsSession.getSelectedRestaurant().id;
  initializeAdmins();

  // defines
  function initializeAdmins () {
    return rcsHttp.Restaurant.listAdmin(restaurantId)
      .success(function (res) {
        admins = res.Admins;
        $scope.adminRows = getAdminRows();
      })
    // >>> mock
    // for (var i = 10 - 1; i >= 0; i--) {
    //   admins.push({Email: 'admin' + i});
    // }

    // $scope.adminRows = getAdminRows();
    // <<< mock
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
    if (!$scope.newAdminEmail) {
      return true;
    }

    for (var i = admins.length - 1; i >= 0; i--) {
      if (admins[i].Email == $scope.newAdminEmail) {
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
        $scope.deleteItem = admin.Name + '(' + admin.Email + ')';
        $scope.clickDelete = clickDelete;
        $scope.clickCancel = clickCancel;

        function clickDelete () {
          // >>> mock
          // $hideDialog();
          // admins.splice(admins.indexOf(admin), 1);
          // assignAdminScope.adminRows = getAdminRows();
          // return;
          // <<< mock

          return rcsHttp.Restaurant.removeAdmin(
            restaurantId,
            admin.Email
          )
          .success(function () {
            $hideDialog();
            admins.splice(admins.indexOf(admin), 1);
            assignAdminScope.adminRows = getAdminRows();
          })
          .error(function (res, status) {
            if (status === 400) {
              alert(res || 400);
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
    var newAdminEmail = $scope.newAdminEmail;
    if (!newAdminEmail) {
      return;
    }

    if (ifDisableAddAdmin()) {
      return alert('无法重复添加用户:' + newAdminEmail);
    }

    return rcsHttp.Restaurant.addAdmin(restaurantId, newAdminEmail)
      .success(function (res) {
        admins.push(res.Admin);
        $scope.adminRows = getAdminRows();
        $scope.newAdminEmail = null;
      })
      .error(function (res, status) {
        if (status === 400) {
          alert(res || 400);
        } else {
          alert(status);
        }
      });
  }
}