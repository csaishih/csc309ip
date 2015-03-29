var restful = require('node-restful');
var mongoose = restful.mongoose;

var userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	login: {
		email: {
			type: String,
			required: true,
			index: {
				unique: true
			}
		},
		password: {
			type: String,
			required: true
		}
	},
	date: {
		type: Date,
		default: Date.now
	},
	rating: {
		likes: [{
			type: String,
			index: {
				unique: true
			},
			default: []
		}],
		dislikes: [{
			type: String,
			index: {
				unique: true
			},
			default: []
		}]
	}
}, {
	versionKey: false
});

module.exports = restful.model('Users', userSchema);