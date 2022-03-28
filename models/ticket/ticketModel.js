const mongoose = require('mongoose');
const validator = require('validator');
const { ERRORS } = require('@constants/tdb-constants');

const ticketSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
		email: {
			type: String,
			lowercase: true,
			validate: [validator.isEmail, ERRORS.INVALID.INVALID_SIGNUP_CREDENTIALS],
			index: true,
		},
		phone: {
			type: String,
			validate: [validator.isMobilePhone, ERRORS.INVALID.INVALID_SIGNUP_CREDENTIALS],
			index: true,
		},
		type: {
			type: String,
			index: true,
			enum: {
				values: ['Technical Assistance', 'Advertisement Assistance'],
			},
			message: ERRORS.INVALID.ASSISTANCE_TYPE,
		},
		description: {
			type: String,
		},
		status: {
			type: String,
			default: 'opened',
			enum: {
				values: ['opened', 'closed'],
			},
			message: ERRORS.INVALID.ASSISTANCE_STATUS,
		},
		closedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

ticketSchema.index({ type: 1, phone: 1, email: 1 });

ticketSchema.index({
	phone: 'text',
	email: 'text',
	status: 'text',
	type: 'text',
});

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
