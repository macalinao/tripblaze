'use strict';

angular.module('tripmakerApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('create', {
        url: '/create',
        templateUrl: 'app/create/create.html',
        controller: 'CreateCtrl'
      });
  });
