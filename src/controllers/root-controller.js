var root = angular.module('root', ['angularModalService', 'ngAnimate', 'toastr']);
root.controller('RootController', ['$scope', '$http', 'ModalService', '$window', 'toastr', function($scope, $http, ModalService, $window, toastr) {
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
							toastr.error('Error', 'Invalid email or password', {closeButton: true});
							$scope.login();
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
				var data = JSON.stringify(eval("({ name: '" + result.name + "', email: '" + result.email + "', password: '" + result.password + "' })"));
				$http.post('signup', data).success(function(response) {
					if (response) {
						$scope.login();
					} else {
						console.log("Error");
						toastr.error('Error', 'Sign up failed', {closeButton: true});
						$scope.signup();
					}
				});
			});
		});
	};


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
	if ($scope.password != $scope.repassword) {
		toastr.error('Error', 'Passwords do not match!', {closeButton: true});
	}
	$scope.submit = function() {
		console.log($scope.name);
		console.log($scope.email);
		console.log($scope.password);
		console.log($scope.repassword);
		if ($scope.name == undefined) {
			toastr.error('Error', 'Please enter your name', {closeButton: true});
		} else if ($scope.email == undefined) {
			toastr.error('Error', 'Please enter a valid email', {closeButton: true});
		} else if ($scope.password == undefined) {
			toastr.error('Error', 'Please enter your password', {closeButton: true});
		} else if (!$scope.checkPassword($scope.password, $scope.repassword)) {
			toastr.error('Error', 'Passwords do not match!', {closeButton: true});
		} else {
			console.log("It got here");
			close({
				name: $scope.name,
				email: $scope.email,
				password: $scope.password,
				repassword: $scope.repassword
			}, 500);
		}
	};

	$scope.cancel = function() {
		$element.modal('hide');
		close({}, 500);
	};

	$scope.checkPassword = function(password, repassword) {
		//Should check more than this
		if (password != repassword) {
			toastr.error('Error', 'Passwords do not match!', {closeButton: true});
		}
		return password == repassword;
	}
}]);