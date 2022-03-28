const mongoose = require('mongoose');

const carViews = new mongoose.Schema({
	ip: {
		type: String,
		required: true,
	},
	car_id: {
		type: String,
		required: true,
	},
});
carViews.index({ ip: 1, car_id: 1 });
const CarView = mongoose.model('CarView', carViews);
module.exports = CarView;
