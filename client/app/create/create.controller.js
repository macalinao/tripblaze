'use strict';

angular.module('tripmakerApp')
  .controller('CreateCtrl', function($scope) {
    $scope.message = 'Hello';

    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 8
    };
  });
