var main = angular.module('main', ['angularModalService']);
main.controller('MainController', ['$scope', '$http', 'ModalService', '$window', function($scope, $http, ModalService, $window) {
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
		console.log(id);
	};

	$scope.create = function() {
		ModalService.showModal({
			templateUrl: '/src/html/modal_create.html',
			controller: 'MainModalController',
			inputs: {
				title: '',
				description: '',
				category: '',
				tags: []
			}
		}).then(function(modal) {
			modal.element.modal();
			modal.close.then(function(result) {
				if (Object.keys(result).length == 0 || result.title == '' || result.description == '' || result. category == '' || result.tags == '') {
					console.log("Error");
				} else {
					var str = "{ title: '" + result.title + "', description: '" + result.description + "', category: '" + result.category + "', tags: ['";
					var i;
					for (i = 0; i < result.tags.length; i++ ){
						str += result.tags[i] + "', '";
					}
					str = str.substring(0, str.length - 4) + "'] }";
					var data = JSON.stringify(eval("(" + str + ")"));
					$scope.update(null, data);
				}
			});
		});
	};


	$scope.edit = function(id, title, description, category, tags, likes, dislikes) {
		ModalService.showModal({
			templateUrl: '/src/html/modal_edit.html',
			controller: 'MainModalController',
			inputs: {
				title: title,
				description: description,
				category: category,
				tags: tags
			}
		}).then(function(modal) {
			modal.element.modal();
			modal.close.then(function(result) {
				if (Object.keys(result).length == 0) {
					console.log("User cancelled");
				} else {
					var str = "{ title: '" + result.title + "', description: '" + result.description + "', category: '" + result.category + "', tags: ['";
					var i;
					for (i = 0; i < result.tags.length; i++ ){
						str += result.tags[i] + "', '";
					}
					str = str.substring(0, str.length - 4) + "'], likes: " + likes + ", dislikes: " + dislikes + " }";
					console.log(str);
					var data = JSON.stringify(eval("(" + str + ")"));
					$scope.update(id, data);
				}
			});
		});
	};

	$scope.remove = function(id) {
		console.log(id);
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
}]);

main.controller('MainModalController', ['$scope', '$element', 'title', 'description', 'category', 'tags', 'close', function($scope, $element, title, description, category, tags, close) {
	$scope.clean = function(str) {
		return str.trim();
	};

	$scope.title = title;
	$scope.description = description;
	$scope.category = category;

	var tag = "";
	var i;
	for (i = 0; i < tags.length; i++) {
		tag += $scope.clean(tags[i]) + ';'; 
	}

	$scope.tags = tag.substring(0, tag.length - 1);
	var backup_tag = tag.substring(0, tag.length - 1);

	$scope.submit = function() {
		var newTags = $scope.tags.replace(/;+/g, ";");
		newTags = newTags.replace(/'/g, "\\'");

		if (newTags.charAt(newTags.length - 1) == ';') {
			newTags = newTags.substring(0, newTags.length - 1).split(';');
		} else {
			newTags = newTags.split(';');
		}
		
		$scope.title = $scope.title == '' ? title : $scope.title;
		$scope.description = $scope.description == '' ? description : $scope.description;
		$scope.category = $scope.category == '' ? category : $scope.category;

		newTags = newTags == '' ? backup_tag.split(';') : newTags;
		for (i = 0; i < newTags.length; i++){
			newTags[i] = $scope.clean(newTags[i]);
		}

		close({
			title: $scope.clean($scope.title),
			description: $scope.clean($scope.description),
			category: $scope.clean($scope.category),
			tags: newTags
		}, 500);
	};

	$scope.cancel = function() {
		$element.modal('hide');
		close({}, 500);
	};


}]);