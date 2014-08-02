'use strict';

angular.module('tripmakerApp')
  .controller('CreateCtrl', function($scope, $http, $modal, $filter) {
    // Survey
    var survey = $modal.open({
      templateUrl: 'app/create/survey.html',
      controller: 'SurveyCtrl',
      size: 'md'
    });

    survey.result.then(function(res) {
      function fmt(d) {
        return $filter('date')(d, 'yyyy-MM-dd');
      }

      $http({
        url: '/sabre/' + res.airport + '/' + res.type,
        params: {
          departureDate: fmt(res.departureDate),
          returnDate: fmt(res.returnDate)
        }
      }).success(function(data) {
        var flightSelect = $modal.open({
          templateUrl: 'app/create/flights.html',
          controller: 'FlightsCtrl',
          size: 'md',
          resolve: {
            dests: function() {
              return data.dests;
            }
          }
        });
        flightSelect.result.then(function(rez) {
          $scope.settings = {
            destination: rez.dest,
            days: (function() {
              var one = moment(res.departureDate);
              var two = moment(res.returnDate);

              var millisecondsPerDay = 1000 * 60 * 60 * 24;
              var millisBetween = two - one;
              var days = millisBetween / millisecondsPerDay;

              // Round down.
              return Math.floor(days);
            })(),
            flight: rez
          };
        });
      });
    });

    $scope.settings = {
      destination: 'philadelphia',
      days: 9
    };

    $scope.map = {
      center: {
        latitude: 0,
        longitude: 0
      },
      control: {},
      zoom: 15
    };

    $scope.$watch('currentDay', function(current, old) {
      var map = $scope.map.control.getGMap();
      _.forEach(old.pois, function(poi) {
        if (poi.line) {
          poi.line.setMap(null);
        }
        if (poi.marker) {
          poi.marker.setMap(null);
        }
      });
      _.forEach(current.pois, function(poi) {
        if (poi.line) {
          poi.line.setMap(map);
        }
        if (poi.marker) {
          poi.marker.setMap(map);
        }
      });
      if (!current.pois) {
        return;
      }
      if (current.pois.length > 0) {
        $scope.map.center = {
          latitude: current.pois[0].map_pos_lat,
          longitude: current.pois[0].map_pos_lng
        };
      }
      $scope.updateDistances();
    });

    $scope.days = [];
    $scope.currentDay = {};

    $scope.pois = [];

    $scope.getLastPoi = function() {
      if ($scope.currentDay.pois.length > 0) {
        return $scope.currentDay.pois[$scope.currentDay.pois.length - 1];
      }
      return null;
    };

    $scope.updateDistances = function() {
      var lastPoi = $scope.getLastPoi();
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
      data.latLng = new google.maps.LatLng(data.map_pos_lat, data.map_pos_lng);
      data.marker = new google.maps.Marker({
        position: data.latLng,
        map: map,
        title: data.name,
        icon: {
          url: data.img
        }
      });

      if (lastPoi) {
        data.line = new google.maps.Polyline({
          path: [
            lastPoi.latLng,
            data.latLng
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

    $scope.$watch('settings', function() {
      $scope.days = _.times($scope.settings.days, function(n) {
        return {
          id: n + 1,
          pois: []
        };
      });

      $scope.currentDay = $scope.days[0];

      $http.get('/pois/' + $scope.settings.destination).then(function(data) {
        $scope.pois = data.data.pois;
        $scope.map.center.latitude = data.data.loc.lat;
        $scope.map.center.longitude = data.data.loc.lng;
        $scope.updateDistances();
      });
    });
  })
  .filter('sortAlgorithm', function() {
    return function(pois) {
      return _.sortBy(pois, function(poi) {
        return -1 * poi.rating * Math.pow(0.3, poi.dist / 10);
      });
    };
  });
