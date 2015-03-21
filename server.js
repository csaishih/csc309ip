var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var user = require('./src/js/user');
var app = express();
var server = app.listen(8080);
var io = require('socket.io').listen(server);

//For parsing body
app.use(bodyParser.urlencoded({ extended: false}));

//For parsing cookies
app.use(cookieParser());

//For serving static files
app.use("/src", express.static(__dirname + "/src"));

//Root page
app.get('/', function(req, res) {
	var cookie = req.cookies.email;
	user.authenticateEmail(cookie, function(success) {
		if (success) {
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
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var repassword = req.body.repassword;

	//Authenticate signup
	user.authenticateSignUp(email, password, repassword, function(success) {
		if (success) {
			user.createUser(name, email, password);
			res.redirect('/login.html');
		} else {
			//Authentication failed
			console.log("Sign up failed");
			res.redirect('/signup.html');
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

app.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	user.authenticateLogin(email, password, function(success) {
		if (success) {
			//Successful login
			res.cookie("email", email, {
				path: '/',
				httpOnly: true,
				maxAge: 604800000
			});
			console.log("Successful login");
			res.redirect('/mainpage.html');
		} else {
			//Authentication failed
			console.log("Login failed");
			res.redirect('/login.html');
		}
	});
});

app.post('/submitidea', function(req, res) {
	var title = req.body.title;
	var description = req.body.description;
	var tags = req.body.tags;
	var category = req.body.category;
	var date = new Date();
	var dateyear = date.getFullYear();
	var datemonth = date.getMonth() + 1;
	var dateday = date.getDate();
	user.insertIdea(title, description, tags, category, dateyear, datemonth, dateday, function(success) {
		if (success) {
			res.redirect('/');
			console.log("Insert success");
		} else {
			res.redirect('/createidea');
			console.log("Insert failed");
		}
	});
});

io.on('connection', function(socket) {
	user.test(function(result) {
		socket.emit('go', {
			msg: result
		});
	});
});
