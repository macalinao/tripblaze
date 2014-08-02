angular.module('tripmakerApp')
  .controller('FlightsCtrl', function($scope, $http, $modalInstance, dests) {
    $scope.dests = dests;
    console.log($scope.dests);
    $scope.select = function(dest) {
      $modalInstance.close(dest);
    };
  });
