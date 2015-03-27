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
app.use('/node_modules', express.static(__dirname + '/node_modules'));

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

//Login page
app.get('/login.html', function(req, res) {
	res.sendFile('src/html/login.html', {root: __dirname});
});

//Sign up page
app.get('/signup.html', function(req, res) {
	res.sendFile('src/html/signup.html', {root: __dirname});
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
	var email = req.body.email;
	var password = req.body.password;
	var repassword = req.body.repassword;
	Auth.authenticateSignUp(req.body.email, req.body.password, req.body.repassword, function(result) {
		if (result) {
			Auth.createUser(req.body.name, req.body.email, req.body.password);
			console.log('Auth.authenticateSignUp: Pass');
			res.redirect('/login.html');
		} else {
			console.log('Auth.authenticateSignUp: Fail');
			res.redirect('/signup.html');
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
			console.log("Auth.authenticateLogin: Pass");
			res.redirect('/main.html');
		} else {
			console.log("Auth.authenticateLogin: Fail");
			res.redirect('/login.html');
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
	var cookie = req.cookies.email;
	Auth.getUserIdeas(cookie, function(result) {
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

console.log("App is running");
app.listen(8080);