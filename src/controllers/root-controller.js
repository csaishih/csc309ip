var root = angular.module('root', ['angularModalService', 'ngAnimate', 'toastr']);
root.controller('RootController', ['$scope', '$http', 'ModalService', '$window', 'toastr', function($scope, $http, ModalService, $window, toastr) {
	toastr.success('hi', 'bro', {closeButton: true});
	$scope.login = function() {
		ModalService.showModal({
			templateUrl: '/src/html/modal_login.html',
			controller: 'LoginModalController'
		}).then(function(modal) {
			modal.element.modal();
			modal.close.then(function(result) {
				if (Object.keys(result).length == 0 || result.email == '' || result.password == '') {
					console.log("Error");
				} else {
					var data = JSON.stringify(eval("({ email: '" + result.email + "', password: '" + result.password + "' })"));
					$http.post('/login', data).success(function(response) {
						if (response) {
							$window.location.href = '/';
						} else {
							console.log("Error");
						}
					});
				}
			});
		});
	};

	$scope.signup = function(id, title, description, category, tags, likes, dislikes) {
		ModalService.showModal({
			templateUrl: '/src/html/modal_signup.html',
			controller: 'SignupModalController'
		}).then(function(modal) {
			modal.element.modal();
			modal.close.then(function(result) {
				if (Object.keys(result).length == 0 || result.name == '' || result.email == '' || result.password == '' || result.repassword == '' || !$scope.checkPassword(result.password, result.repassword)) {
					console.log("Error");
				} else {
					var data = JSON.stringify(eval("({ name: '" + result.name + "', email: '" + result.email + "', password: '" + result.password + "' })"));
					$http.post('signup', data).success(function(response) {
						if (response) {
							$scope.login();
						} else {
							console.log("Error");
						}
					});
				}
			});
		});
	};

	$scope.checkPassword = function(password, repassword) {
		//Should check more than this
		return password == repassword;
	}
}]);

root.controller('LoginModalController', ['$scope', '$element', 'close', function($scope, $element, close) {
	$scope.submit = function() {
		close({
			email: $scope.email,
			password: $scope.password
		}, 500);
	};

	$scope.cancel = function() {
		$element.modal('hide');
		close({}, 500);
	};
}]);

root.controller('SignupModalController', ['$scope', '$element', 'close', function($scope, $element, close) {
	$scope.submit = function() {
		close({
			name: $scope.name,
			email: $scope.email,
			password: $scope.password,
			repassword: $scope.repassword
		}, 500);
	};

	$scope.cancel = function() {
		$element.modal('hide');
		close({}, 500);
	};
}]);