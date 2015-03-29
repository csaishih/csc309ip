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
			$scope.authorEmail = response.author.email;

			var data = JSON.stringify(eval("({ date: '" + response.date + "' })"));
			$http.post('/convertDate', data).success(function(response) {
				$scope.year = response.year;
				$scope.month = response.month;
				$scope.day = response.day;
			});
		});


	};
	refresh();

	$scope.logout = function() {
		$http.post('/logout').success(function(response) {
			$window.location.href = '/';
		});
	}
});