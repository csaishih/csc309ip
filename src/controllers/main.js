var main = angular.module('main', ['angularModalService']);
main.controller('MainController', ['$scope', '$http', 'ModalService', function($scope, $http, ModalService) {
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

	$scope.edit = function(id, title, description, category, tags, likes, dislikes) {
		console.log(id);
		ModalService.showModal({
			templateUrl: '/src/controllers/template.html',
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
				console.log(result.title);
				console.log(result.description);
				console.log(result.category);
				console.log(result.tags);

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
    			console.log("Delete document: Fail");
    		}
		});
	};

	$scope.update = function(id, data) {
		$http.put('/idea/' + id, data).success(function(response) {
			if (response) {
    			refresh();
    		} else {
    			console.log("Delete document: Fail");
    		}
		});
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

	$scope.tags = tag;

	$scope.submit = function() {
		var newTags;
		if ($scope.tags.charAt($scope.tags.length - 1) == ';') {
			newTags = $scope.tags.substring(0, $scope.tags.length - 1);
		} else {
			newTags = $scope.tags;
		}
		newTags = newTags.split(';');
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