angular.module('tripmakerApp')
  .controller('SurveyCtrl', function($scope, $http, $modalInstance) {
    $scope.result = {
      airport: '',
      destination: '',
      type: '',
      departureDate: '',
      returnDate: ''
    };

    $scope.format = 'yyyy-MMMM-dd';
    $scope.opened = {};

    $scope.openCal = function(el, $event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened[el] = true;
    };

    $scope.themes = [];
    $http.get('/sabre_cats').success(function(data) {
      $scope.themes = data.themes;
    });

    $scope.submit = function() {
      $modalInstance.close($scope.result);
    };
  });
