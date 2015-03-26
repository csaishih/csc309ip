var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var server = app.listen(8080);
var io = require('socket.io').listen(server);
var User = require('./models/user');
var Idea = require('./models/idea');
var Auth = require('./src/js/authenticate')

mongoose.connect('mongodb://localhost/restful');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use('/api', require('./src/routes/api'));
app.use('/src', express.static(__dirname + '/src'));

app.get('/', function(req, res) {
	var cookie = req.cookies.email;
	Auth.authenticateEmail(cookie, function(result) {
		if (result) {
			res.sendFile('src/html/mainpage.html', {root: __dirname});
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
app.get('/mainpage.html', function(req, res) {
	res.sendFile('src/html/mainpage.html', {root: __dirname});
});

app.get('/createidea.html', function(req, res) {
	res.sendFile('src/html/createidea.html', {root: __dirname});
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
			res.redirect('/mainpage.html');
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

app.post('/createidea', function(req, res) {
	res.redirect('/createidea.html');
});

app.post('/submitidea', function(req, res) {
	var title = req.body.title;
	var description = req.body.description;
	var tags = req.body.tags;
	var category = req.body.category;
	var cookie = req.cookies.email;

	if (title == '' || typeof category == 'undefined') {
		console.log("Auth.createIdea: Fail");
		res.redirect('/createidea.html');
	} else {
		Auth.createIdea(title, description, tags, category, cookie);
		console.log("Auth.createIdea: Pass");
		res.redirect('/');
	}
});

console.log("Running");