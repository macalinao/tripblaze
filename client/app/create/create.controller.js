'use strict';

angular.module('tripmakerApp')
  .controller('CreateCtrl', function($scope, $http) {
    $scope.settings = {
      destination: 'philadelphia'
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
    $scope.$watch('currentDay', function() {
      $scope.updateDistances();
    });

    $scope.itineraries = {};
    $scope.days = [1, 2, 3, 4, 5];

    $scope.pois = [];

    $scope.getCurPois = function() {
      var its = $scope.itineraries;
      var cur = $scope.currentDay;

      var curPois = its[cur];
      if (!curPois) {
        curPois = its[cur] = [];
      }
      return curPois;
    };

    $scope.getLastPoi = function() {
      var curPois = $scope.getCurPois();
      if (!curPois || curPois.length === 0) {
        _.forEach($scope.pois, function(poi) {
          poi.dist = -1;
        });
        return;
      }
      return curPois[curPois.length - 1];
    };

    $scope.updateDistances = function() {
      var lastPoi = $scope.getLastPoi();
      if (!lastPoi) {
        return;
      }

      function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c * 0.621371; // Distance in miles
        return d;
      }

      function deg2rad(deg) {
        return deg * (Math.PI / 180)
      }

      _.forEach($scope.pois, function(poi) {
        poi.dist = getDistanceFromLatLon(poi.map_pos_lat, poi.map_pos_lng, lastPoi.map_pos_lat, lastPoi.map_pos_lng).toFixed(1);
      });
    };

    $scope.addCurrentDay = function(data, event) {
      var curPois = $scope.getCurPois();
      if (curPois) {
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
      $scope.updateDistances();
    };

    $http.get('/pois/' + $scope.settings.destination).then(function(data) {
      $scope.pois = data.data.pois;
      $scope.map.center.latitude = data.data.loc.lat;
      $scope.map.center.longitude = data.data.loc.lng;
      $scope.updateDistances();
    });
  })
  .filter('sortAlgorithm', function() {
    return function(pois) {
      return _.sortBy(pois, function(poi) {
        return -1 * poi.rating * Math.pow(0.3, poi.dist / 10);
      });
    };
  });
