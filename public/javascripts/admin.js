angular.module('hurleyisms', [])
  .controller('AdminController', ['$scope', '$http', function ($scope, $http) {
      $scope.Lines = [];
      $scope.GetLines = function () {
          $http.get('admin/data').then(function (data) {
              $scope.Lines = data.data;
          });
      }
      $scope.GetLines();
      $scope.Approve = function (line) {
          $http.get('admin/' + line._id + "/approve").then(function (data) {
              line.approved = true;
          });
      }
      $scope.Delete = function (line) {
          $http.get('admin/' + line._id + "/delete").then(function (data) {
              $scope.GetLines();
          });
      }
      $scope.Update = function (line) {
          if(line.edit) delete line.edit;
          $http.post('admin/update', line).then(function (data) {
              $scope.GetLines();
          });
      }
      $scope.Ban = function (line) {
          $http.post('admin/ban',line).then(function (data) {
              $scope.GetLines();
          });
      }
  }]);