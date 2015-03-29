var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var User = require('./src/models/user');
var Idea = require('./src/models/idea');
var Auth = require('./src/authenticate')
var app = express();

mongoose.connect('mongodb://localhost/restful');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use('/api', require('./src/routes/api'));
app.use('/src', express.static(__dirname + '/src'));

app.get('/', function(req, res) {
	Auth.authenticateEmail(req.cookies.email, function(result) {
		if (result) {
			res.sendFile('src/html/main.html', {root: __dirname});
		} else {
			res.sendFile('src/html/root.html', {root: __dirname});
		}
	});
});

//Root page
app.get('/root.html', function(req, res) {
	res.sendFile('src/html/root.html', {root: __dirname});
});

//Main page
app.get('/main.html', function(req, res) {
	Auth.authenticateEmail(req.cookies.email, function(result) {
		if (result) {
			res.sendFile('src/html/main.html', {root: __dirname});
		} else {
			res.redirect('/');
		}
	});
});

app.post('/signup', function(req, res) {
	Auth.authenticateSignUp(req.body.email, function(success) {
		if (success) {
			Auth.createUser(req.body.name, req.body.email, req.body.password, function(result) {
				res.send(true);
			});
		} else {
			res.send(false);
		}
	});
});

app.post('/login', function(req, res) {
	Auth.authenticateLogin(req.body.email, req.body.password, function(result) {
		if (result) {
			res.cookie("email", req.body.email, {
				path: '/',
				httpOnly: true,
				maxAge: 604800000
			});
			res.send(true);
		} else {
			res.send(false);
		}
	});
});

app.post('/logout', function(req, res) {
	res.clearCookie("email");
	res.redirect('/root.html');
});

app.post('/createIdea', function(req, res) {
	Auth.createIdea(req.body.title, req.body.description, req.body.category, req.body.tags, req.cookies.email, function(result) {
		res.json(result);
	});
});

app.get('/getUserIdeas', function(req, res) {
	Auth.getUserIdeas(req.cookies.email, function(result) {
		res.json(result);
	});
});

app.get('/getOtherIdeas', function(req, res) {
	Auth.getOtherIdeas(req.cookies.email, function(result) {
		res.json(result);
	});
});

app.put('/idea/:id', function(req, res) {;
	Auth.updateIdea(req.params.id, req.body.title, req.body.description, req.body.category, req.body.tags, req.body.likes, req.body.dislikes, function(result) {
		res.json(result);
	});
});

app.delete('/idea/:id', function(req, res) {
	Auth.deleteIdea(req.params.id, function(result) {
		res.json(result);
	});
});

app.get('/username', function(req, res) {
	Auth.findUsername(req.cookies.email, function(result) {
		res.send(result);
	});
});

app.get('/findRating/:id', function(req, res) {
	Auth.findRating(req.cookies.email, req.params.id, function(result) {
		res.json(result);
	});
});

app.put('/user/:flag', function(req, res) {
	if (req.body.flag == -1) {
		Auth.pullUserRating(req.cookies.email, req.params.flag, req.body.id, function(result) {
			res.json(result);
		});
	} else if (req.body.flag == 1){
		Auth.pushUserRating(req.cookies.email, req.params.flag, req.body.id, function(result) {
			res.json(result);
		});	
	} else if (req.body.flag == 0) {
		Auth.pushUserRating(req.cookies.email, req.params.flag, req.body.id, function(result) {
			Auth.pullUserRating(req.cookies.email, (1 - req.params.flag), req.body.id, function(result) {
				res.json(result);
			});
		});			
	}
});

app.get('/getRatings', function(req, res) {
	Auth.getRatings(req.cookies.email, function(result) {
		res.json(result);
	});
});

console.log("App is running");
app.listen(8080);