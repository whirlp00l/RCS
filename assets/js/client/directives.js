angular
  .module('rcs')
  .directive('breadcrumb', ['$state', '$stateParams', '$interpolate', breadcrumb]);

function breadcrumb ($state, $stateParams, $interpolate) {
  return {
    link: link,
    restrict: 'E',
    templateUrl: '/template/directive-breadcrumb',
    replace: true
  };

  function link (scope, element, attrs) {
    return scope.$watch((function() {
      return $state.current;
    }), function(current) {
      var states, title, _ref, _ref1;
      states = [];
      while (current != null) {
        title = ($interpolate((_ref = (_ref1 = current.data) != null ? _ref1.title : void 0) != null ? _ref : ''))($stateParams);
        if (title !== '') {
          states.push(angular.extend({
            title: title
          }, current));
        }
        current = current.parent;
      }
      states.reverse();
      return scope.states = states;
    });
  }
}