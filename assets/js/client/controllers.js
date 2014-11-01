angular
  .module('rcs')
  .controller('pageCtrl', ['$rootScope', '$scope', '$state', '$materialSidenav', '$materialToast', 'rcsSession', pageCtrl])
  .controller('signInCtrl', ['$scope', '$state', 'rcsHttp', 'rcsSession', 'ERROR_MESSAGE', signInCtrl])
  .controller('listRestaurantCtrl', ['$scope', '$state', 'rcsHttp', 'rcsSession', listRestaurantCtrl])
  .controller('newRestaurantCtrl', ['$scope', '$state', 'rcsHttp', 'rcsSession', newRestaurantCtrl])
  .controller('monitorCtrl', ['$rootScope', '$scope', '$state', 'rcsSession', 'RCS_EVENT', monitorCtrl])
  .controller('monitorTableCtrl', ['$scope', 'rcsSession', monitorTableCtrl])
  .controller('monitorRequestCtrl', ['$rootScope', '$scope', 'rcsSession', 'RCS_EVENT', monitorRequestCtrl])
  .controller('monitorWaiterCtrl', ['$rootScope', '$scope', 'rcsSession', 'RCS_EVENT', monitorWaiterCtrl])
  .controller('authorMenuCtrl', ['$scope', '$state', '$timeout', '$materialDialog', 'rcsHttp', 'rcsSession', 'makeArrayTextFilter', 'makeNumberFilter', authorMenuCtrl])
  .controller('arrangeWaiterCtrl', ['$scope', '$state', '$materialDialog', 'rcsHttp', 'rcsSession', arrangeWaiterCtrl])
  .controller('assignAdminCtrl', ['$scope', '$state', '$materialDialog', 'rcsHttp', 'rcsSession', assignAdminCtrl]);

// shared
function requestErrorAction (res, status) {
  if (status === 400) {
    alert(res || 400);
  } else {
    alert(status);
  }
}

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
  $scope.signIn = { email: '', pwd: '' };
  $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '', name: '', role: 'admin' };
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

  // defines
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

    if (!info.email) {
      return alert(ERROR_MESSAGE.emailInvalid);
    }

    if (info.pwd !== info.pwdConfirm) {
      return alert(ERROR_MESSAGE.passwordMismatch);
    }

    rcsHttp.User.create(info.email, info.pwd, info.role, info.key, info.name)
      .success(function success () {
        $scope.signIn.email = info.email;
        $scope.signIn.pwd = info.pwd;
        closeSignUp();
        $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '', name: '', role: 'admin' };
      })
      .error(requestErrorAction);
  }

  function closeSignUp () {
    $scope.signUpShown = false;
    $scope.signUp = { email: '', pwd: '', pwdConfirmd: '', key: '', name: '', role: 'admin' };
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

        if ($scope.restaurants.length == 0 && rcsSession.getSignedInUser().Role == 'manager') {
          return $state.go('page.restaurant.new');
        }
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
      .error(requestErrorAction);
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
  $rootScope.$on(RCS_EVENT.requestsUpdate, initializeRequests);

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

function monitorWaiterCtrl ($rootScope, $scope, rcsSession, RCS_EVENT) {
  // scope fields
  $scope.waiters = [];

  // scope methods
  $scope.clickToggleBusy = clickToggleBusy;
  $scope.getFreeWaiterCount = getFreeWaiterCount;
  $scope.getOnlineWaiterCount = getOnlineWaiterCount;
  $scope.ifOnline = ifOnline;

  // events
  $rootScope.$on(RCS_EVENT.waitersUpdate, initializeWaiters);

  // initialize
  initializeWaiters();

  // defines
  function initializeWaiters () {
    $scope.waiters = rcsSession.getWaiters();
    $scope.safeApply();
  }

  function clickToggleBusy (waiter) {
    rcsSession.toggleWaiterBusy(waiter,
      null, requestErrorAction);
  }

  function getOnlineWaiterCount () {
    var count = 0;
    for (var i = $scope.waiters.length - 1; i >= 0; i--) {
      if ($scope.waiters[i].Online == true) {
        count++;
      }
    }

    return count;
  }

  function getFreeWaiterCount () {
    var count = 0;
    for (var i = $scope.waiters.length - 1; i >= 0; i--) {
      if ($scope.waiters[i].Online == true && $scope.waiters[i].Busy == false) {
        count++;
      }
    }

    return count;
  }

  function ifOnline (waiter) {
    return waiter.Online == true;
  }
}

function authorMenuCtrl($scope, $state, $timeout, $materialDialog, rcsHttp, rcsSession, makeArrayTextFilter, makeNumberFilter) {
  // scope fields
  $scope.flavorRequirements = null;
  $scope.menuItems = null;
  $scope.menuTypes = null;
  $scope.newMenuItem = null;
  $scope.newType = '';
  $scope.selectedIndex = 0;
  $scope.justClickUpdate = false;

  // scope methods
  $scope.clickDeleteItem = clickDeleteItem;
  $scope.clickDiscardChange = clickDiscardChange;
  $scope.clickFlavorRequirements = clickFlavorRequirements;
  $scope.clickItemFlavor = clickItemFlavor;
  $scope.clickItemType = clickItemType;
  $scope.clickNewItem = clickNewItem;
  $scope.clickNewType = clickNewType;
  $scope.clickResetNewItem = clickResetNewItem;
  $scope.clickToggleStar = clickToggleStar;
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
        $scope.flavorRequirements = res.FlavorRequirements;

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
      PremiumPrice: '',
      Alias: ''
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

  function clickFlavorRequirements () {
    var authorMenuScope = $scope;

    $materialDialog({
      templateUrl: 'template/dialog-editFlavorRequirements',
      targetEvent: event,
      clickOutsideToClose: false,
      escapeToClose: false,
      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
        // scope fields
        $scope.requirements =
          authorMenuScope.flavorRequirements ?
          angular.copy(authorMenuScope.flavorRequirements) :
          [];

        $scope.newRequirement = null;

        // scope methods
        $scope.ifValidNewRequirement = ifValidNewRequirement;
        $scope.clickDeleteRequirement = clickDeleteRequirement;
        $scope.clickNewRequirements = clickNewRequirements;
        $scope.clickUpdateFlavorRequirements = clickUpdateFlavorRequirements;
        $scope.clickCancel = clickCancel;

        // defines
        function ifValidNewRequirement () {
          return $scope.newRequirement && $scope.requirements.indexOf($scope.newRequirement) == -1;
        }

        function clickDeleteRequirement (index) {
          $scope.requirements.splice(index, 1);
        }

        function clickNewRequirements () {
          if (!$scope.ifValidNewRequirement()) return;

          $scope.requirements.push($scope.newRequirement);
          $scope.newRequirement = null;
        }

        function clickUpdateFlavorRequirements () {
          rcsHttp.Restaurant.updateFlavorRequirements(
            restaurantId,
            $scope.requirements
          )
          .success(function(res) {
            authorMenuScope.flavorRequirements = res.FlavorRequirements;
            $hideDialog();
          })
          .error(requestErrorAction);
        }

        function clickCancel () {
          $hideDialog();
        }
      }]
    });
  }

  function clickItemFlavor (menuItem, event) {
    var i = $scope.menuItems.indexOf(menuItem);
    var authorMenuScope = $scope;

    var dialogEditMenuItemFlavor = {
      templateUrl: 'template/dialog-editMenuItemFlavor',
      targetEvent: event,
      clickOutsideToClose: false,
      escapeToClose: false,
      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
        // scope fields
        $scope.flavorList = menuItem.Flavor ? angular.copy(menuItem.Flavor) : [];
        $scope.name = menuItem.Name;
        $scope.newFlavor = null;

        // scope methods
        $scope.ifValidNewFlavor = ifValidNewFlavor;
        $scope.clickDeleteFlavor = clickDeleteFlavor;
        $scope.clickNewFlavor = clickNewFlavor;
        $scope.clickUpdateFlavorList = clickUpdateFlavorList;
        $scope.clickCancel = clickCancel;

        // defines
        function ifValidNewFlavor () {
          return $scope.newFlavor && $scope.flavorList.indexOf($scope.newFlavor) == -1;
        }

        function clickDeleteFlavor (index) {
          $scope.flavorList.splice(index, 1);
        }

        function clickNewFlavor () {
          if (!$scope.ifValidNewFlavor()) return;

          $scope.flavorList.push($scope.newFlavor);
          $scope.newFlavor = null;
        }

        function clickUpdateFlavorList () {
          rcsHttp.MenuItem.update(
            menuItem.Restaurant,
            menuItem.id,
            undefined, // not to change Type
            undefined, // not to change Price
            undefined, // not to change PremiumPrice
            undefined, // not to change Alias
            $scope.flavorList
          )
          .success(function(res) {
            var updatedMenuItem = res.MenuItem;
            authorMenuScope.menuItems[i] = angular.copy(updatedMenuItem);
            master.menuItems[i] = angular.copy(updatedMenuItem);
            $hideDialog();
          })
          .error(requestErrorAction);
        }

        function clickCancel () {
          $hideDialog();
        }
      }]
    }
    $materialDialog(dialogEditMenuItemFlavor);
  }

  function clickItemType (menuItem, event) {
    var i = $scope.menuItems.indexOf(menuItem);
    var authorMenuScope = $scope;

    var dialogEditMenuItemType = {
      templateUrl: 'template/dialog-editMenuItemType',
      targetEvent: event,
      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
        $scope.name = menuItem.Name;
        $scope.types = authorMenuScope.menuTypes;
        $scope.selectedType = menuItem.Type;
        $scope.clickUpdateType = clickUpdateType;
        $scope.clickCancel = clickCancel;

        function clickUpdateType () {
          if ($scope.selectedType == menuItem.Type) {
            $hideDialog();
          }

          rcsHttp.MenuItem.update(
            menuItem.Restaurant,
            menuItem.id,
            $scope.selectedType,
            master.menuItems[i].Price,
            master.menuItems[i].PremiumPrice,
            master.menuItems[i].Alias
          )
          .success(function(res) {
            var updatedMenuItem = res.MenuItem;
            authorMenuScope.menuItems[i].Type = updatedMenuItem.Type;
            master.menuItems[i] = angular.copy(updatedMenuItem);
            authorMenuScope.selectedIndex =  authorMenuScope.menuTypes.indexOf(updatedMenuItem.Type);
            $hideDialog();
          })
          .error(requestErrorAction);
        }

        function clickCancel () {
          $hideDialog();
        }
      }]
    }
    $materialDialog(dialogEditMenuItemType);
  }

  function clickUpdateItem (menuItem) {
    if ($scope.justClickUpdate) return;

    $scope.justClickUpdate = true;

    var i = $scope.menuItems.indexOf(menuItem);

    rcsHttp.MenuItem.update(
      menuItem.Restaurant,
      menuItem.id,
      menuItem.Type,
      menuItem.Price,
      menuItem.PremiumPrice == '' ? null : menuItem.PremiumPrice,
      menuItem.Alias == '' ? null: menuItem.Alias
    )
    .success(function(res) {
      $scope.justClickUpdate = false;
      var updatedMenuItem = res.MenuItem;
      $scope.menuItems[i] = updatedMenuItem;
      master.menuItems[i] = angular.copy(updatedMenuItem);
    })
    .error(function(res, status) {
      $scope.justClickUpdate = false;
      requestErrorAction(res, status);
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
          rcsHttp.MenuItem.delete(
            menuItem.Restaurant,
            menuItem.id
          )
          .success(function(res) {
            $hideDialog();
            authorMenuScope.menuItems.splice(i, 1);
            master.menuItems.splice(i, 1);
          })
          .error(requestErrorAction);
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

    var newMenuItem = $scope.newMenuItem;
    return rcsHttp.MenuItem.create(
      restaurantId,
      newMenuItem.Name,
      newMenuItem.Type,
      newMenuItem.Price,
      newMenuItem.PremiumPrice == '' ? null : newMenuItem.PremiumPrice,
      newMenuItem.Alias == '' ? null: newMenuItem.Alias)
    .success(function(res) {
      var createdMenuItem = res.MenuItem;
      $scope.menuItems.push(createdMenuItem);
      master.menuItems.push(angular.copy(createdMenuItem));
      $scope.clickResetNewItem();
    })
    .error(requestErrorAction);
  }

  function clickToggleStar (menuItem) {
    if ($scope.justClickUpdate) return;

    $scope.justClickUpdate = true;

    var i = $scope.menuItems.indexOf(menuItem);

    rcsHttp.MenuItem.update(
      menuItem.Restaurant,
      menuItem.id,
      undefined, // ingore Type,
      undefined, // ingore Price,
      undefined, // ingore PremiumPrice,
      undefined, // ingore Alias
      undefined, // ingore Flavor
      !menuItem.IsRecommended ? true: false
    )
    .success(function(res) {
      $scope.justClickUpdate = false;
      var updatedMenuItem = res.MenuItem;
      $scope.menuItems[i] = updatedMenuItem;
      master.menuItems[i] = angular.copy(updatedMenuItem);
    })
    .error(function(res, status) {
      $scope.justClickUpdate = false;
      requestErrorAction(res, status);
    });
  }
}

function arrangeWaiterCtrl($scope, $state, $materialDialog, rcsHttp, rcsSession) {
  // scope fields
  $scope.waiters = null;
  $scope.newWaiterName = '';

  // scope methods
  $scope.clickAddWaiter = clickAddWaiter;
  $scope.clickDeleteWaiter = clickDeleteWaiter;
  $scope.clickToggleOnline = clickToggleOnline;
  $scope.ifDisableAddWaiter = ifDisableAddWaiter;

  // initialize
  if (!rcsSession.getSelectedRestaurant()) {
    return $state.go('page.restaurant.list');
  }

  var restaurantId = rcsSession.getSelectedRestaurant().id;
  initializeWaiter();

  // defines
  function initializeWaiter () {
    return rcsHttp.Restaurant.listWaiter(restaurantId)
      .success(function (res) {
        $scope.waiters = res.Waiters;
      })
  }

  function clickAddWaiter () {
    if ($scope.ifDisableAddWaiter()) return;

    rcsHttp.Waiter.create(
      restaurantId,
      $scope.newWaiterName
    )
    .success(function (res) {
      $scope.waiters.push(res.Waiter);
      $scope.newWaiterName = '';
    })
    .error(requestErrorAction);
  }

  function clickDeleteWaiter (waiter, event) {
    var i = $scope.waiters.indexOf(waiter);
    var waiterScope = $scope;

    var dialogDelete = {
      templateUrl: 'template/dialog-deleteTemplate',
      targetEvent: event,
      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
        $scope.deleteFrom = '服务员';
        $scope.deleteItem = waiter.Name;
        $scope.clickDelete = clickDelete;
        $scope.clickCancel = clickCancel;

        function clickDelete () {
          rcsHttp.Waiter.delete(
            waiter.Restaurant,
            waiter.id
          )
          .success(function(res) {
            $hideDialog();
            waiterScope.waiters.splice(i, 1);
          })
          .error(requestErrorAction);
        }

        function clickCancel () {
          $hideDialog();
        }
      }]
    };
    $materialDialog(dialogDelete);
  }

  function clickToggleOnline (waiter) {
    var i = $scope.waiters.indexOf(waiter);

    rcsHttp.Waiter.updateOnline(
      waiter.Restaurant,
      waiter.id,
      !waiter.Online
    )
   .success(function (res) {
     $scope.waiters[i] = res.Waiter;
   })
   .error(requestErrorAction);
  }

  function ifDisableAddWaiter () {
    return !$scope.newWaiterName || $scope.waiters.indexOf($scope.newWaiterName) != -1;
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
      });
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
          .error(requestErrorAction);
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
      .error(requestErrorAction);
  }
}