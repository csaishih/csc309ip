var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var user = require('./src/js/user');
var nodeMailer = require('nodemailer');
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
	console.log(cookie);
	user.authenticateEmail(cookie, function(success) {
		if (success) {
			res.sendFile('src/html/mainpage.html', {root: __dirname});
		} else {
			res.sendFile('src/html/root.html', {root: __dirname});
		}
	});
	
});

//Login page
app.get('/login.html', function(req, res) {
	res.sendFile('src/html/login.html', {root: __dirname});
});

//Sign up page
app.get('/signup.html', function(req, res) {
	res.sendFile('src/html/signup.html', {root: __dirname});
});

//Set up page
app.get('/setup.html', function(req, res) {
	res.sendFile('src/html/setup.html', {root: __dirname});
});

//Lost password page
app.get('/lostpw.html', function(req, res) {
	res.sendFile('src/html/lostpw.html', {root: __dirname});
});

//Main page
app.get('/mainpage.html', function(req, res) {
	res.sendFile('src/html/mainpage.html', {root: __dirname});
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
		}
	});
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
		}
	});
});

app.post('/lostpw', function(req, res) {
	var email = req.body.email;
	user.authenticateEmail(email, function(success) {
		if (success) {
			var newPassword = user.generate_password(13, 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890');
			console.log(newPassword);
			user.changePassword(email, newPassword, function(success) {
				if (success) {
					var transporter = nodeMailer.createTransport({
						service: 'gmail',
						auth: {
							user: 'csc301ututor@gmail.com',
							pass: 'team1ututor'
						}
					});
					transporter.sendMail({
						from: 'csc301ututor@gmail.com',
						to: email,
						subject: 'Reset password',
						text: "Hello,\n\nYour temporary password is: " + newPassword + "\nPlease sign in and change your password.\n\nRegards,\nCommunity Fund Admin"
					});
					res.redirect('/login.html');
				} else {
					console.log("Failed to change password");
				}
			});
		} else {
			console.log("Cannot reset password. Email not found");
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