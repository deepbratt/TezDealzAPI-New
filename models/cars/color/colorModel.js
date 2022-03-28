const mongoose = require('mongoose');

const carColor = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'color name is required'],
	},
	code: {
		type: String,
		required: [true, 'color code is required'],
	},
});

const CarColor = mongoose.model('CarColor', carColor);
module.exports = CarColor;
