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
				normalized: title.toLowerCase(),
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
			}, function(err, result) {
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

function getOtherIdeas(email, callback) {
	User.findOne({
		'login.email': email
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			if (result.filter.length > 0) {
				if (result.sortingPreference.sortBy == 'date') {
					Idea.find({
						'author.id': {$ne: result._id},
						'category': {$in: result.categoryPreference},
						'tags': {$in: result.filter}
					}, null, {
						sort: {
							'date': result.sortingPreference.order
						}
					}, function(err, result) {
						if (err) {
							console.log(err);
							throw err;
						} else {
							console.log(result);
							callback(result);
						}
					});
				} else if (result.sortingPreference.sortBy == 'normalized') {
					Idea.find({
						'author.id': {$ne: result._id},
						'category': {$in: result.categoryPreference},
						'tags': {$in: result.filter}
					}, null, {
						sort: {
							'normalized': result.sortingPreference.order
						}
					}, function(err, result) {
						if (err) {
							console.log(err);
							throw err;
						} else {
							callback(result);
						}
					});
				}
			} else {
				if (result.sortingPreference.sortBy == 'date') {
					Idea.find({
						'author.id': {$ne: result._id},
						'category': {$in: result.categoryPreference}
					}, null, {
						sort: {
							'date': result.sortingPreference.order
						}
					}, function(err, result) {
						if (err) {
							console.log(err);
							throw err;
						} else {
							callback(result);
						}
					});
				} else if (result.sortingPreference.sortBy == 'normalized') {
					Idea.find({
						'author.id': {$ne: result._id},
						'category': {$in: result.categoryPreference}
					}, null, {
						sort: {
							'normalized': result.sortingPreference.order
						}
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

function categoryCount(callback) {
	var category_count = {
		health: 0,
		technology: 0,
		education: 0,
		finance: 0,
		travel: 0
	}
	Idea.find({
		'category': "Health"
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			category_count.health = result.length;
			Idea.find({
				'category': "Technology"
			}, function(err, result) {
				if (err) {
					console.log(err);
					throw err;
				} else {
					category_count.technology = result.length;
					Idea.find({
						'category': "Education"
					}, function(err, result) {
						if (err) {
							console.log(err);
							throw err;
						} else {
							category_count.education = result.length;
							Idea.find({
								'category': "Finance"
							}, function(err, result) {
								if (err) {
									console.log(err);
									throw err;
								} else {
									category_count.finance = result.length;
									Idea.find({
										'category': "Travel"
									}, function(err, result) {
										if (err) {
											console.log(err);
											throw err;
										} else {
											category_count.travel = result.length;
											callback(category_count);
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}

function getIdea(id, callback) {
	Idea.findOne({
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

function getUser(email, callback) {
	User.findOne({
		'login.email': email
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			callback(result);
		}
	});
}

function updateCategory(email, category, flag, callback) {
	if (flag == 1) {
		User.findOneAndUpdate({
			'login.email': email
		},
		{
			$push: {
				'categoryPreference': category
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
				'categoryPreference': category
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

function updateSorting(email, order, sortBy, callback) {
	User.findOneAndUpdate({
		'login.email': email
	},
	{
		$set: {
			'sortingPreference.order': order,
			'sortingPreference.sortBy': sortBy
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

function setFilter(email, clear, tags, callback) {
	if (clear == 1) {
		User.findOneAndUpdate({
			'login.email': email
		},
		{
			$set: {
				'filter': []
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
	} else {
		var correctTags = (tags.replace(/;+/g, ";")).replace(/'/g, "\\'");

		if (correctTags.charAt(correctTags.length - 1) == ';') {
			correctTags = correctTags.substring(0, correctTags.length - 1)
		}

		if (correctTags.charAt(0) == ';') {
			correctTags = correctTags.substring(1, correctTags.length)
		}

		correctTags = correctTags.split(';');
		User.findOneAndUpdate({
			'login.email': email
		},
		{
			$set: {
				'filter': correctTags
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

function retrieve(posInt, sdate, edate, callback) {
	sdate = new Date(sdate);
	edate = new Date(edate);
	sdate.setHours(0);
	sdate.setMinutes(0);
	sdate.setSeconds(0);
	edate.setHours(23);
	edate.setMinutes(59);
	edate.setSeconds(59);
	Idea.find({
		'date': {
			$gte: sdate,
			$lt: edate
		}
	}, null, {
		sort: {
			'rating.likes': -1
		}
	}, function(err, result) {
		if (err) {
			console.log(err);
			throw err;
		} else {
			if (posInt > result.length) {
				posInt = result.length;
			}
			callback(result.slice(0, posInt));
		}
	});
}

exports.authenticateEmail = authenticateEmail;
exports.authenticateSignUp = authenticateSignUp;
exports.authenticateLogin = authenticateLogin;
exports.createUser = createUser;
exports.createIdea = createIdea;
exports.getIdea = getIdea;
exports.getUser = getUser;
exports.getUserIdeas = getUserIdeas;
exports.getOtherIdeas = getOtherIdeas;
exports.deleteIdea = deleteIdea;
exports.updateIdea = updateIdea;
exports.findRating = findRating;
exports.pushUserRating = pushUserRating;
exports.pullUserRating = pullUserRating;
exports.getRatings = getRatings;
exports.categoryCount = categoryCount;
exports.updateCategory = updateCategory;
exports.updateSorting = updateSorting;
exports.setFilter = setFilter;
exports.retrieve = retrieve;