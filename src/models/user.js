var restful = require('node-restful');
var mongoose = restful.mongoose;

var date = new Date();
var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
var year = date.getFullYear();
var month = date.getMonth();
var day = date.getDate();
var parsedDate = months[month] + ' ' + day + ', ' + year;

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
	parsedDate: {
		type: String,
		default: parsedDate
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
	},
	categoryPreference: {
		type: Array,
		default: ["Health", "Technology", "Education", "Finance", "Travel"]
	},
	sortingPreference: {
		order: {
			type: Number,
			default: 1
		},
		sortBy: {
			type: String,
			default: 'date'
		}
	}
}, {
	versionKey: false
});

module.exports = restful.model('Users', userSchema);