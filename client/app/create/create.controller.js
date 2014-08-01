'use strict';

angular.module('tripmakerApp')
  .controller('CreateCtrl', function($scope, $http) {
    $scope.message = 'Hello';

    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 10
    };

    $scope.pois = [];
    $http.get('/pois/Paris').then(function(data) {
      $scope.pois = data.data.pois;
      $scope.map.center.latitude = data.data.loc.lat;
      $scope.map.center.longitude = data.data.loc.lng;
    });
  });
