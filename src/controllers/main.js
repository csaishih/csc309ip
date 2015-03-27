var main = angular.module('main', ['angularModalService']);
main.controller('MainController', ['$scope', '$http', 'ModalService', '$window', function($scope, $http, ModalService, $window) {
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
			controller: 'ModalController',
			inputs: {
				title: '',
				description: '',
				category: '',
				tags: []
			}
		}).then(function(modal) {
			modal.element.modal();
			modal.close.then(function(result) {
				if (result.title == '' || result.description == '' || result. category == '' || result.tags == '') {
					//handle error
					console.log("Must have non empty fields");
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
			controller: 'ModalController',
			inputs: {
				title: title,
				description: description,
				category: category,
				tags: tags
			}
		}).then(function(modal) {
			modal.element.modal();
			modal.close.then(function(result) {
				var str = "{ title: '" + result.title + "', description: '" + result.description + "', category: '" + result.category + "', tags: ['";
				var i;
				for (i = 0; i < result.tags.length; i++ ){
					str += result.tags[i] + "', '";
				}
				str = str.substring(0, str.length - 4) + "'], likes: " + likes + ", dislikes: " + dislikes + " }";
				var data = JSON.stringify(eval("(" + str + ")"));
				$scope.update(id, data);
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

main.controller('ModalController', ['$scope', '$element', 'title', 'description', 'category', 'tags', 'close', function($scope, $element, title, description, category, tags, close) {
	$scope.title = title;
	$scope.description = description;
	$scope.category = category;

	var tag = '';
	var i;
	for (i = 0; i < tags.length; i++) {
		tag += tags[i] + ';'; 
	}

	$scope.tags = tag.substring(0, tag.length - 1);
	var backup_tag = tag.substring(0, tag.length - 1);

	$scope.submit = function() {
		var newTags;
		if ($scope.tags.charAt($scope.tags.length - 1) == ';') {
			newTags = $scope.tags.substring(0, $scope.tags.length - 1);
		} else {
			newTags = $scope.tags;
		}
		newTags = newTags.split(';');

		$scope.title = $scope.title == '' ? title : $scope.title;
		$scope.description = $scope.description == '' ? description : $scope.description;
		$scope.category = $scope.category == '' ? category : $scope.category;

		newTags = newTags == '' ? backup_tag.split(';') : newTags;

		close({
			title: $scope.title,
			description: $scope.description,
			category: $scope.category,
			tags: newTags
		}, 500);
	};

	$scope.cancel = function() {
		$element.modal('hide');
		close({
			title: title,
			description: description,
			category: category,
			tags: tags
		}, 500);
	};
}]);