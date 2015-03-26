var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Idea = require('../models/idea');

User.methods(['get', 'put', 'post', 'delete']);
User.register(router, '/users');

Idea.methods(['get', 'put', 'post', 'delete']);
Idea.register(router, '/ideas');

module.exports = router;