angular.module('hurleyisms', [''])
  .controller('AdminController', ['$scope', '$http', function($scope, $http) {
    $scope.Lines = [];
    $http.get('admin/data').then(function(data){
    	cachedLines = data;
    });
    console.log("got here");
    $scope.test = "got it";
  }]);