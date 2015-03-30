var app = angular.module('view', ['ui.bootstrap', 'ngAnimate', 'toastr']);
app.controller('ViewController', function($scope, $modal, $http, $window) {
	var refresh = function() {
		var location = $window.location.href;
		$http.get('/getIdea/' + location.substring(location.length - 24, location.length)).success(function(response) {
			$scope.title = response.title;
			$scope.description = response.description;
			$scope.category = response.category;
			$scope.tags = response.tags;
			$scope.ratingLikes = response.rating.likes;
			$scope.ratingDislikes = response.rating.dislikes;
			$scope.authorName = response.author.name;
			$scope.date = response.date;
			$scope.parsedDate = response.parsedDate;

			var total = $scope.ratingLikes + $scope.ratingDislikes;
			if (total > 0) {
				$scope.likes = (100 * $scope.ratingLikes) / total;
				$scope.dislikes = (100 * $scope.ratingDislikes) / total;
			}
		});
	};
	refresh();

	$scope.goBack = function() {
		$window.location.href = '/';
	}

	$scope.logout = function() {
		$http.post('/logout').success(function(response) {
			$window.location.href = '/';
		});
	}
});