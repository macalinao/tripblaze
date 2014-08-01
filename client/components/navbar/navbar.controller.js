'use strict';

angular.module('tripmakerApp')
.controller('NavbarCtrl', function ($scope, $location) {
  $scope.menu = [{
    'title': 'Home',
  'link': '/'
  }, {
    title: 'Create',
  link: '/create'
  }];

  $scope.isCollapsed = true;

  $scope.isActive = function(route) {
    return route === $location.path();
  };
});
