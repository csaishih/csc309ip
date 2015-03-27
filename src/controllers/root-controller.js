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

	$scope.signup = function() {
		ModalService.showModal({
			templateUrl: '/src/html/modal_signup.html',
			controller: 'SignupModalController'
		}).then(function(modal) {
			modal.element.modal();
			modal.close.then(function(result) {
				if (Object.keys(result).length == 0) {
					console.log("Error");
				} else {
					var data = JSON.stringify(eval("({ name: '" + result.name + "', email: '" + result.email + "', password: '" + result.password + "' })"));
					$http.post('signup', data).success(function(response) {
						if (response) {
							$scope.login();
						} else {
							console.log("Cancel");
						}
					});
				}
			});
		});
	};


}]);

root.controller('LoginModalController', ['$scope', '$element', 'toastr', 'close', function($scope, $element, toastr, close) {
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

root.controller('SignupModalController', ['$scope', '$element', 'toastr', 'close', function($scope, $element, toastr, close) {
	$scope.checkErrorName = function() {
		if ($scope.name == '' || $scope.name == undefined) {
			toastr.error('Please enter your name', 'Error', {
				"closeButton": true,
				"hideDuration": "3000",
				"timeOut": "2500"
			});
			return true;
		} else {
			return false;
		}
	};

	$scope.checkErrorEmail = function() {
		if ($scope.email == '' || $scope.email == undefined) {
			toastr.error('Please enter a valid email', 'Error', {
				"closeButton": true,
				"hideDuration": "3000",
				"timeOut": "2500"
			});
			return true;
		} else {
			return false;
		}		
	};

	$scope.checkErrorPassword = function() {
		if ($scope.password == '' || $scope.password == undefined) {
			toastr.error('Please enter your password', 'Error', {
				"closeButton": true,
				"hideDuration": "3000",
				"timeOut": "2500"
			});
			return true;
		} else {
			return false;
		}		
	};

	$scope.checkErrorRepassword = function() {
		if ($scope.repassword == '' || $scope.repassword == undefined) {
			toastr.error('Please re-enter your password', 'Error', {
				"closeButton": true,
				"hideDuration": "3000",
				"timeOut": "2500"
			});
			return true;
		} else {
			return false;
		}
	};

	$scope.submit = function() {
		if (!$scope.checkErrorName() && !$scope.checkErrorEmail() && !$scope.checkErrorPassword() && !$scope.checkErrorRepassword() && $scope.checkPassword($scope.password, $scope.repassword)) {
			console.log("pass");
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
			toastr.error('Passwords do not match!', 'Error', {
				"closeButton": true,
				"hideDuration": "3000",
				"timeOut": "2500"
			});
			return false;
		}
		return password == repassword;
	}
}]);