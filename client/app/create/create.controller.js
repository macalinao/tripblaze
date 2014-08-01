'use strict';

angular.module('tripmakerApp')
  .controller('CreateCtrl', function($scope, $http) {
    $scope.message = 'Hello';

    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 8
    };

    $scope.pois = [];
    $http.get('/pois/Paris').then(function(data) {
      $scope.pois = data.data.pois;
    });
  });
