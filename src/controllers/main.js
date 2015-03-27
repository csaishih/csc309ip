var main = angular.module('main', []);
main.controller('MainController', ['$scope', '$http', function($scope, $http) {
	var refresh = function() {
		$http.get('/getUserIdeas').success(function(response) {
			$scope.userIdeas = response;
			console.log($scope.userIdeas);
		});
		$http.get('/getOtherIdeas').success(function(response) {
			$scope.otherIdeas = response;
			console.log($scope.otherIdeas);
		});
	};
	refresh();

	$scope.view = function(id) {
		console.log(id);
	};

	$scope.edit = function(id) {
		console.log(id);
	};

	$scope.remove = function(id) {
		console.log(id);
		$http.delete('/idea/' + id).success(function(response) {
			if (response) {
    			refresh();
    		} else {
    			console.log("Delete document: Fail");
    		}
		});
	};
}]);