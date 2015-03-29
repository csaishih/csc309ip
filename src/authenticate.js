var bcrypt = require('bcrypt');
var User = require('./models/user');
var Idea = require('./models/idea');

function authenticateEmail(email, callback) {
	User.findOne({
		'login.email' : email
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			callback(result != null);
		}
	});
}

function authenticateSignUp(email, callback) {
	authenticateEmail(email, function(result) {
		if (result) {
			callback(false);
		} else {
			callback(true);
		}
	});
}

function authenticateLogin(email, password, callback) {
	User.findOne({
		'login.email' : email
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			if (result == null) {
				callback(false);
			} else {
				bcrypt.compare(password, result.login.password, function(err, res) {
					if (err) {
						console.log(err);
						throw err;
					} else {
						callback(res);
					}
				});
			}
		}
	});
}

function createUser(name, email, password, callback) {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(password, salt, function(err, hash) {
			if (err) {
				console.log(err);
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
						console.log(err);
						throw err;
					} else {
						callback(result);
					}
				});
			}
		});
	});
}

function createIdea(title, description, category, tags, email, callback) {
	User.findOne({
		'login.email': email
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			new Idea({
				author: {
					'id': result._id,
					'name': result.name,
					'email': result.login.email
				},
				title: title,
				description: description,
				tags: tags,
				category: category
			}).save(function(err, result) {
				if (err) {
					console.log(err);
					throw err;
				} else {
					callback(result);
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
			console.log(err);
			throw err;
		} else {
			Idea.find({
				'author.id': result._id
			}, function(err2, result2) {
				if (err2) {
					console.log(err2);
					throw err2;
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
			console.log(err);
			throw err;
		} else {
			Idea.find({
				'author.id': {$ne: result._id}
			}, function(err2, result2) {
				if (err2) {
					console.log(err2);
					throw err2;
				} else {
					callback(result2);
				}
			});
		}
	});
}

function deleteIdea(id, callback) {
	Idea.remove({
		'_id': id
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			callback(result);
		}
	});
}

function updateIdea(id, title, description, category, tags, likes, dislikes, callback) {
	Idea.findOneAndUpdate({
		'_id': id
	},
	{
		$set: {
			'title': title,
			'description': description,
			'category': category,
			'tags': tags
		},
		$inc: {
			'rating.likes': likes,
			'rating.dislikes': dislikes
		}
	},
	{
		new: true
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			callback(result);
		}
	});
}

function findUsername(email, callback) {
	User.findOne({
		'login.email' : email
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			callback(result.name);
		}
	});
}

function findRating(email, id, callback) {
	User.findOne({
		'login.email': email,
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else if (result) {
			if ((result.rating.likes).indexOf(id) > -1) {
				callback(1);
			} else if ((result.rating.dislikes).indexOf(id) > -1) {
				callback(-1);
			} else {
				callback(0);
			}
		} else {
			console.log("FATAL ERROR");
			callback(404);
		}
	});
}

function pushUserRating(email, flag, id, callback) {
	if (flag == 1) {
		User.findOneAndUpdate({
			'login.email': email
		},
		{
			$push: {
				'rating.likes': id
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});	
	} else if (flag == 0) {
		User.findOneAndUpdate({
			'login.email': email
		},
		{
			$push: {
				'rating.dislikes': id
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});	
	}
}

function pullUserRating(email, flag, id, callback) {
	if (flag == 1) {
		User.findOneAndUpdate({
			'login.email': email
		},
		{
			$pull: {
				'rating.likes': id
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});	
	} else if (flag == 0) {
		User.findOneAndUpdate({
			'login.email': email
		},
		{
			$pull: {
				'rating.dislikes': id
			}
		},
		{
			new: true
		}, function(err, result) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				callback(result);
			}
		});	
	}
}

function getRatings(email, callback) {
	User.findOne({
		'login.email': email,
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			callback(result.rating);
		}
	});
}

exports.findUsername = findUsername;
exports.authenticateEmail = authenticateEmail;
exports.authenticateSignUp = authenticateSignUp;
exports.authenticateLogin = authenticateLogin;
exports.createUser = createUser;
exports.createIdea = createIdea;
exports.getUserIdeas = getUserIdeas;
exports.getOtherIdeas = getOtherIdeas;
exports.deleteIdea = deleteIdea;
exports.updateIdea = updateIdea;
exports.findRating = findRating;
exports.pushUserRating = pushUserRating;
exports.pullUserRating = pullUserRating;
exports.getRatings = getRatings;