'use strict';

angular.module('tripmakerApp')
  .controller('CreateCtrl', function($scope, $http) {
    $scope.settings = {
      destination: 'philadelphia',
      days: 9
    };

    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 15,
      control: {}
    };

    $scope.$watch('currentDay', function() {
      $scope.updateDistances();
    });

    $scope.days = _.times($scope.settings.days, function(n) {
      return {
        id: n + 1,
        pois: []
      };
    });
    $scope.currentDay = $scope.days[0];

    $scope.pois = [];

    $scope.updateDistances = function() {
      var lastPoi = $scope.currentDay.pois[0];
      if (!lastPoi) {
        _.forEach($scope.pois, function(poi) {
          poi.dist = -1;
        });
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

      var lowest = 1000;
      _.forEach($scope.currentDay.pois, function(poi) {
        if (poi === lastPoi) {
          return;
        }
        poi.dist = getDistanceFromLatLon(poi.map_pos_lat, poi.map_pos_lng, lastPoi.map_pos_lat, lastPoi.map_pos_lng).toFixed(1);
        lowest = Math.min(poi.dist, lowest);
      });

      if (lowest === 1000) {
        return;
      }

      if (lowest < 0.5) {
        $scope.map.zoom = 17;
      } else if (lowest < 1) {
        $scope.map.zoom = 16;
      } else if (lowest < 2) {
        $scope.map.zoom = 15;
      } else if (lowest < 4) {
        $scope.map.zoom = 14;
      } else if (lowest < 8) {
        $scope.map.zoom = 13;
      } else if (lowest < 11) {
        $scope.map.zoom = 12;
      } else {
        $scope.map.zoom = 11;
      }
    };

    $scope.addCurrentDay = function(data, event) {
      var curPois = $scope.currentDay.pois;
      if (curPois.length > 0) {
        var lastPoi = curPois[curPois.length - 1];
      }
      curPois.push(data);

      var poiIndex = $scope.pois.indexOf(data);
      if (poiIndex > -1) {
        $scope.pois.splice(poiIndex, 1);
      }

      $scope.map.center = {
        latitude: data.map_pos_lat,
        longitude: data.map_pos_lng
      };

      var map = $scope.map.control.getGMap();
      var latLng = new google.maps.LatLng(data.map_pos_lat, data.map_pos_lng);
      var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: data.name,
        icon: {
          url: data.img
        }
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
