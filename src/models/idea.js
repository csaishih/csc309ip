var restful = require('node-restful');
var mongoose = restful.mongoose;

var ideaSchema = new mongoose.Schema({
	author: {
		id: String,
		name: String,
		email: String
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: false
	},
	category: {
		type: String,
		required: true
	},
	tags: [String],
	date: {
		type: Date,
		default: Date.now
	},
	rating: {
		likes: {
			type: Number,
			default: 0
		},
		dislikes: {
			type: Number,
			default: 0
		}
	}
}, {
	versionKey: false
});

module.exports = restful.model('Ideas', ideaSchema);