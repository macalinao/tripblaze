angular.module('tripmakerApp')
  .controller('SurveyCtrl', function($scope) {
    $scope.format = 'dd-MMMM-yyyy';
    $scope.opened = {};

    $scope.openCal = function(el, $event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened[el] = true;
    };
  });
