var app = angular.module('main', ['ui.bootstrap', 'ngAnimate', 'toastr']);
app.controller('MainController', function($scope, $modal, $http, $window) {
	var refresh = function() {
		$http.get('/username').success(function(response) {
			$scope.username = response;
		})
		$http.get('/getUserIdeas').success(function(response) {
			$scope.userIdeas = response;
		});
		$http.get('/getOtherIdeas').success(function(response) {
			$scope.otherIdeas = response;
		});
	};
	refresh();

	$scope.logout = function() {
		$http.post('/logout').success(function(response) {
			$window.location.href = '/';
		});
	};

	$scope.view = function(id) {
	};

	$scope.create = function() {
		var modalInstance = $modal.open({
			templateUrl: '/src/html/modal_idea.html',
			controller: 'MainModalController',
			resolve: {
				input: function() {
					return {
						title: '',
						description: '',
						category: '',
						tags: [],
						pagetext: 'Creating'
					};
				}
			}
		});

		modalInstance.result.then(function(result) {
			var str = "{ title: '" + result.title + "', description: '" + result.description + "', category: '" + result.category + "', tags: ['";
			var i;
			for (i = 0; i < result.tags.length; i++ ){
				str += result.tags[i] + "', '";
			}
			str = str.substring(0, str.length - 4) + "'] }";
			var data = JSON.stringify(eval("(" + str + ")"));
			$scope.update(null, data);		
		});
	};

	$scope.edit = function(id, title, description, category, tags, likes, dislikes) {
		var modalInstance = $modal.open({
			templateUrl: '/src/html/modal_idea.html',
			controller: 'MainModalController',
			resolve: {
				input: function() {
					return {
						title: title,
						description: description,
						category: category,
						tags: tags,
						pagetext: 'Editing'
					};
				}
			}
		});

		modalInstance.result.then(function(result) {
			var str = "{ title: '" + result.title + "', description: '" + result.description + "', category: '" + result.category + "', tags: ['";
			var i;
			for (i = 0; i < result.tags.length; i++ ){
				str += result.tags[i] + "', '";
			}
			str = str.substring(0, str.length - 4) + "'], likes: " + likes + ", dislikes: " + dislikes + " }";
			var data = JSON.stringify(eval("(" + str + ")"));
			$scope.update(id, data);
		});
	};

	$scope.remove = function(id) {
		$http.delete('/idea/' + id).success(function(response) {
			if (response) {
				refresh();
			} else {
				console.log("Fail");
			}
		});
	};

	$scope.update = function(id, data) {
		if (id == null) {
			$http.post('/createIdea', data).success(function(response) {
				if (response) {
					refresh();
				} else {
					console.log("Fail");
				}
			});			
		} else {
			$http.put('/idea/' + id, data).success(function(response) {
				if (response) {
					refresh();
				} else {
					console.log("Fail");
				}
			});
		}
	};
});

app.controller('MainModalController', function($scope, $modalInstance, toastr, input) {
	$scope.pagetext = input.pagetext;
	$scope.title = input.title;
	$scope.description = input.description;
	$scope.category = input.category;

	var tag = "";
	var i;
	for (i = 0; i < input.tags.length; i++) {
		tag += input.tags[i] + ';'; 
	}
	$scope.tags = tag.substring(0, tag.length - 1);

	$scope.submit = function() {
		var newTags = $scope.tags.replace(/;+/g, ";");
		newTags = newTags.replace(/'/g, "\\'");
		if (newTags.charAt(newTags.length - 1) == ';') {
			newTags = newTags.substring(0, newTags.length - 1).split(';');
		} else {
			newTags = newTags.split(';');
		}
		if ($scope.checkError($scope.title)) {
			toastr.error('Please specifiy a title', 'Error');
		} else if ($scope.checkError($scope.description)) {
			toastr.error('Please enter a desciption for your idea', 'Error');
		} else if ($scope.checkError($scope.category)) {
			toastr.error('Please select a category for this idea', 'Error');
		} else if ($scope.checkError(newTags)) {
			toastr.error('Please enter some keywords/tags for your idea', 'Error');
		} else {
			$modalInstance.close({
				title: $scope.title,
				description: $scope.description,
				category: $scope.category,
				tags: newTags
			});
		}
	};

	$scope.checkError = function(object){
		return (object === undefined || object === '');
	}

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});

app.config(function(toastrConfig) {
	angular.extend(toastrConfig, {
		closeButton: true,
		maxOpened: 1,
		timeOut: 2500
	});
});