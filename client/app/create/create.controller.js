'use strict';

angular.module('tripmakerApp')
  .controller('CreateCtrl', function($scope, $http) {
    $scope.settings = {
      destination: 'Dallas'
    };

    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 10,
      control: {}
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
      } else {
        var lastPoi = curPois[curPois.length - 1];
      }
      curPois.push(data);

      var poiIndex = $scope.pois.indexOf(data);
      if (poiIndex > -1) {
        $scope.pois.splice(poiIndex, 1);
      }

      var map = $scope.map.control.getGMap();
      var latLng = new google.maps.LatLng(data.map_pos_lat, data.map_pos_lng);
      var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: data.name,
        icon: data.img
      });
      data.latLng = latLng;

      if (lastPoi) {
        new google.maps.Polyline({
          path: [
            lastPoi.latLng,
            latLng
          ],
          geodesic: true,
          strokeColor: '#ff0000',
          strokeOpacity: 1.0,
          strokeWeight: 2,
          map: map
        });
      }
    };

    $http.get('/pois/' + $scope.settings.destination).then(function(data) {
      $scope.pois = data.data.pois;
      $scope.map.center.latitude = data.data.loc.lat;
      $scope.map.center.longitude = data.data.loc.lng;
    });
  });
