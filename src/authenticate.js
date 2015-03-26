var bcrypt = require('bcrypt');
var User = require('./models/user');
var Idea = require('./models/idea');

function checkPassword(password, repassword) {
	if (password.length > 4) {
		return password == repassword;
	}
	return false;
}

function authenticateEmail(email, callback) {
	User.findOne({
		'login.email' : email
	}, function(err, result) {
		if (err) {
			throw err;
		} else {
			callback(result != null);
		}
	});
}

function authenticateSignUp(email, password, repassword, callback) {
	authenticateEmail(email, function(result) {
		if (result) {
			callback(false);
		} else {
			callback(checkPassword(password, repassword));
		}
	});
}

function authenticateLogin(email, password, callback) {
	User.findOne({
		'login.email' : email
	}, function(err, result) {
		if (err) {
			throw err;
		} else {
			if (result == null) {
				callback(false);
			} else {
				bcrypt.compare(password, result.login.password, function(err, res) {
					if (err) {
						throw err;
					} else {
						callback(res);
					}
				});
			}
		}
	});
}

function createUser(name, email, password) {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(password, salt, function(err, hash) {
			if (err) {
				return err;
			} else {
				new User({
					name: name,
					login: {
						'email': email,
						'password': hash
					}
				}).save(function(err, result) {
					if (err) {
						throw err;
					}
				});
			}
		});
	});
}

function createIdea(title, description, tags, category, email) {
	User.findOne({
		'login.email': email
	}, function(err, result) {
		if (err) {
			throw err;
		} else {
			if (tags.charAt(tags.length - 1) == ';') {
				tags = tags.substring(0, tags.length - 1);
			}
			var tag = tags.split(';');
			new Idea({
				author: {
					'id': result._id,
					'name': result.name,
					'email': result.login.email
				},
				title: title,
				description: description,
				tags: tag,
				category: category
			}).save(function(err, result) {
				if (err) {
					throw err;
				}
			});
		}
	});
}

function getUserIdeas(email, callback) {
	User.findOne({
		'login.email': email
	}, function(err, result) {
		if (err) {
			throw err;
		} else {
			Idea.find({
				'author.id': result._id
			}, function(err2, result2) {
				if (err) {
					throw err;
				} else {
					callback(result2);
				}
			});
		}
	});
}

function getOtherIdeas(email, callback) {
	User.findOne({
		'login.email': email
	}, function(err, result) {
		if (err) {
			throw err;
		} else {
			Idea.find({
				'author.id': {$ne: result._id}
			}, function(err2, result2) {
				if (err) {
					throw err;
				} else {
					callback(result2);
				}
			});
		}
	});
}
exports.checkPassword = checkPassword;
exports.authenticateEmail = authenticateEmail;
exports.authenticateSignUp = authenticateSignUp;
exports.authenticateLogin = authenticateLogin;
exports.createUser = createUser;
exports.createIdea = createIdea;
exports.getUserIdeas = getUserIdeas;
exports.getOtherIdeas = getOtherIdeas;