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

    $scope.currentDay = 1;
    $scope.itineraries = {};
    $scope.days = [1, 2, 3, 4, 5];

    $scope.pois = [];

    $scope.addCurrentDay = function(data, event) {
      var its = $scope.itineraries;
      var cur = $scope.currentDay;

      var curPois = its[cur];
      if (!curPois) {
        curPois = its[cur] = [];
      }
      curPois.push(data);

      var poiIndex = $scope.pois.indexOf(data);
      if (poiIndex > -1) {
        $scope.pois.splice(poiIndex, 1);
      }
    };

    $http.get('/pois/New York').then(function(data) {
      $scope.pois = data.data.pois;
      $scope.map.center.latitude = data.data.loc.lat;
      $scope.map.center.longitude = data.data.loc.lng;
    });
  });
