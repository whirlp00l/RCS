angular
  .module('rcs')
  .directive('rcsGoBack', ['$state', function ($state) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        
        $scope.goBack = function () {
          if ($state.previous.state.name == '') {
            $state.go('login');
          } else {
            var toStateName = $state.previous.state.name;
            var toStateParams = $state.previous.params;

            $state.go(toStateName, toStateParams);
          }
        }

        if ($state.previous.state.data && $state.previous.state.data.name) {
          $element[0].innerText = '返回' + $state.previous.state.data.name;
        } else {
          $element[0].innerText = '返回登录';
        }
        $element.bind('click', $scope.goBack);
      }
    }
  }])