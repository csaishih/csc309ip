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
		$http.get('/getRatings').success(function(response) {
			$scope.ratings = response;
		});
		$http.get('/categoryCount').success(function(response) {
			var chart = AmCharts.makeChart("chartdiv", {
				"type": "serial",
				"theme": "none",
				"dataProvider": [{
					"category": "Health",
					"visits": response.health,
					"color": "#FF0F00"
				}, {
					"category": "Technology",
					"visits": response.technology,
					"color": "#FF6600"
				}, {
					"category": "Education",
					"visits": response.education,
					"color": "#FF9E01"
				}, {
					"category": "Finance",
					"visits": response.finance,
					"color": "#FCD202"
				}, {
					"category": "Travel",
					"visits": response.travel,
					"color": "#F8FF01"
				}],
				"valueAxes": [{
					"axisAlpha": 0,
					"position": "left",
					"title": "Number of ideas",
					"integersOnly": true
				}],
				"startDuration": 0,
				"graphs": [{
					"balloonText": "<b>[[category]]: [[value]]</b>",
					"fillColorsField": "color",
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"type": "column",
					"valueField": "visits"
				}],
				"chartCursor": {
					"categoryBalloonEnabled": false,
					"cursorAlpha": 0,
					"zoomable": false
				},
				"categoryField": "category",
				"categoryAxis": {
					"gridPosition": "start",
					"labelRotation": 45
				},
				"amExport":{}
			});
		});
	};
	refresh();

	$scope.logout = function() {
		$http.post('/logout').success(function(response) {
			$window.location.href = '/';
		});
	}

	$scope.view = function(id) {
		$window.location.href = '/view/' + id;
	}

	$scope.like = function(id, title, description, category, tags) {
		$http.get('/findRating/' + id).success(function(response) {
			if (response == 1) {
				$http.put('/user/1', {
					id: id,
					flag: -1
				}).success(function(response) {
					$http.put('/idea/' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: -1,
						dislikes: 0
					}).success(function(response) {
						if (response) {
							refresh();
						} else {
							console.log("error");
						}
					});
				});
			} else if (response == 0) {
				$http.put('/user/1', {
					id: id,
					flag: 1
				}).success(function(response) {
					$http.put('/idea/' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: 1,
						dislikes: 0
					}).success(function(response) {
						if (response) {
							refresh();
						} else {
							console.log("error");
						}
					});
				});
			} else if (response == -1) {
				$http.put('/user/1', {
					id: id,
					flag: 0
				}).success(function(response) {
					$http.put('/idea/' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: 1,
						dislikes: -1
					}).success(function(response) {
						if (response) {
							refresh();
						} else {
							console.log("error");
						}
					});
				});
			}
		});
	}

	$scope.dislike = function(id, title, description, category, tags) {
		$http.get('/findRating/' + id).success(function(response) {
			if (response == -1) {
				$http.put('/user/0', {
					id: id,
					flag: -1
				}).success(function(response) {
					$http.put('/idea/' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: 0,
						dislikes: -1
					}).success(function(response) {
						if (response) {
							refresh();
						} else {
							console.log("error");
						}
					});
				});
			} else if (response == 0) {
				$http.put('/user/0', {
					id: id,
					flag: 1
				}).success(function(response) {
					$http.put('/idea/' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: 0,
						dislikes: 1
					}).success(function(response) {
						if (response) {
							refresh();
						} else {
							console.log("error");
						}
					});
				});
			} else if (response == 1) {
				$http.put('/user/0', {
					id: id,
					flag: 0
				}).success(function(response) {
					$http.put('/idea/' + id, {
						title: title,
						description: description,
						category: category,
						tags: tags,
						likes: -1,
						dislikes: 1
					}).success(function(response) {
						if (response) {
							refresh();
						} else {
							console.log("error");
						}
					});
				});
			}
		});
	}

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
	}

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
			str = str.substring(0, str.length - 4) + "'], likes: 0, dislikes: 0 }";
			var data = JSON.stringify(eval("(" + str + ")"));
			$scope.update(id, data);
		});
	}

	$scope.remove = function(id, title, description, category, tags) {
		$http.delete('/idea/' + id).success(function(response) {
			if (response) {
				refresh();
			} else {
				console.log("Fail");
			}
		});
	}

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
	}
});

app.controller('MainModalController', function($scope, $modalInstance, toastr, input) {
	$scope.removeDuplicates = function(source) {
		var tag = "";
		var i;
		for (i = 0; i < source.length; i ++){
			if (tag.indexOf(source[i].trim()) == -1) {
				tag += source[i].trim() + ';';
			}
		}
		return tag;
	}

	$scope.checkError = function(object) {
		return (object === undefined || object === '' || (object[0] == '' && object.length == 1));
	}

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}

	$scope.pagetext = input.pagetext;
	$scope.title = input.title;
	$scope.description = input.description;
	$scope.category = input.category;
	$scope.tags = $scope.removeDuplicates(input.tags);

	$scope.submit = function() {
		var correctTags = ($scope.tags.replace(/;+/g, ";")).replace(/'/g, "\\'");

		if (correctTags.charAt(correctTags.length - 1) == ';') {
			correctTags = correctTags.substring(0, correctTags.length - 1)
		}

		if (correctTags.charAt(0) == ';') {
			correctTags = correctTags.substring(1, correctTags.length)
		}

		correctTags = correctTags.split(';');

		var tags = $scope.removeDuplicates(correctTags);
		tags = tags.substring(0, tags.length - 1).split(';');

		if ($scope.checkError($scope.title)) {
			toastr.error('Please specify a title', 'Error');
		} else if ($scope.checkError($scope.description)) {
			toastr.error('Please enter a desciption for your idea', 'Error');
		} else if ($scope.checkError($scope.category)) {
			toastr.error('Please select a category for this idea', 'Error');
		} else if ($scope.checkError(tags)) {
			toastr.error('Please enter some keywords/tags for your idea', 'Error');
		} else {
			$modalInstance.close({
				title: $scope.title,
				description: $scope.description,
				category: $scope.category,
				tags: tags
			});
		}
	};
});

app.config(function(toastrConfig) {
	angular.extend(toastrConfig, {
		closeButton: true,
		maxOpened: 1,
		timeOut: 2500
	});
});