// const crypto = require('crypto');
// const User = require('../../model/userModel');
// const { AppError, Email } = require('@utils/tdb_globalutils');
// const catchAsync = require('@utils/tdb_globalutils/errorHandling/catchAsync');
// const { ERRORS, STATUS_CODE, SUCCESS_MSG, STATUS } = require('@constants/tdb-constants');
// const sendSMS = require('../../utils/sendSMS');

// exports.sendVerificationCodetoPhone = async (req, res, next) => {
// 	const user = await User.findOne({ phone: req.body.phone });
// 	if (!user) {
// 		return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
// 	}
// 	const verificationToken = await user.phoneVerificationToken();
// 	// console.log(resetToken);
// 	await user.save({ validateBeforeSave: false });

// 	try {
// 		await sendSMS({
// 			body: `Your TezDealz account verification code is ${verificationToken}`,
// 			phone: user.phone, // Text this number
// 			from: process.env.TWILIO_PHONE_NUMBER, // From a valid Twilio number
// 		});

// 		res.status(STATUS_CODE.OK).json({
// 			status: STATUS.UNVERIFIED,
// 			message: SUCCESS_MSG.SUCCESS_MESSAGES.TOKEN_SENT_PHONE,
// 		});
// 	} catch (err) {
// 		user.phoneVerificationCode = undefined;
// 		user.phoneVerificationTokenExpires = undefined;
// 		await user.save({ validateBeforeSave: false });
// 		return next(new AppError(ERRORS.RUNTIME.SENDING_MESSAGE, STATUS_CODE.SERVER_ERROR));
// 	}
// };

// exports.sendVerificationCodetoEmail = async (req, res, next) => {
// 	const user = await User.findOne({ email: req.body.email });

// 	if (!user) {
// 		return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
// 	}

// 	const verificationToken = await user.emailVerificationToken();
// 	await user.save({ validateBeforeSave: false });

// 	try {
// 		await new Email(user, verificationToken).sendEmailVerificationToken();

// 		res.status(STATUS_CODE.OK).json({
// 			status: STATUS.UNVERIFIED,
// 			message: SUCCESS_MSG.SUCCESS_MESSAGES.TOKEN_SENT_EMAIL,
// 		});
// 	} catch (err) {
// 		user.emailVerificationCode = undefined;
// 		user.emailVerificationTokenExpires = undefined;
// 		await user.save({ validateBeforeSave: false });
// 		return next(new AppError(ERRORS.RUNTIME.SENDING_TOKEN, STATUS_CODE.SERVER_ERROR));
// 	}
// };

// // Phone verification
// exports.phoneVerification = catchAsync(async (req, res, next) => {
// 	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
// 	//const hashedToken = req.params.token;

// 	const user = await User.findOne({
// 		phoneVerificationCode: hashedToken,
// 		phoneVerificationTokenExpires: { $gt: Date.now() },
// 	});

// 	if (!user) {
// 		return next(new AppError(ERRORS.INVALID.INVALID_VERIFICATION_TOKEN, STATUS_CODE.UNAUTHORIZED));
// 	}

// 	// check if user is logged in with phone or only want to verify its phone after logged in with email.
// 	if (user.loggedInWithPhone === true) {
// 		user.isVerified = true;
// 		user.isPhoneVerified = true;
// 		user.phoneVerificationCode = undefined;
// 		user.phoneVerificationTokenExpires = undefined;
// 	} else {
// 		user.isPhoneVerified = true;
// 		user.phoneVerificationCode = undefined;
// 		user.phoneVerificationTokenExpires = undefined;
// 	}

// 	await user.save();
// 	res.status(STATUS_CODE.OK).json({
// 		status: STATUS.SUCCESS,
// 		message: SUCCESS_MSG.SUCCESS_MESSAGES.ACCOUNT_VERIFICATION,
// 	});
// });

// // email Verification code
// exports.emailVerification = catchAsync(async (req, res, next) => {
// 	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
// 	//const hashedToken = req.params.token;

// 	const user = await User.findOne({
// 		emailVerificationCode: hashedToken,
// 		emailVerificationTokenExpires: { $gt: Date.now() },
// 	});

// 	if (!user) {
// 		return next(new AppError(ERRORS.INVALID.INVALID_VERIFICATION_TOKEN, STATUS_CODE.UNAUTHORIZED));
// 	}

// 	// check if user is logged in with email or only want to verify its email after logged in with phone.
// 	if (user.loggedInWithEmail === true) {
// 		user.isVerified = true;
// 		user.isEmailVerified = true;
// 		user.emailVerificationCode = undefined;
// 		user.emailVerificationTokenExpires = undefined;
// 	} else {
// 		user.isEmailVerified = true;
// 		user.emailVerificationCode = undefined;
// 		user.emailVerificationTokenExpires = undefined;
// 	}

// 	await user.save();
// 	res.status(STATUS_CODE.OK).json({
// 		status: STATUS.SUCCESS,
// 		message: SUCCESS_MSG.SUCCESS_MESSAGES.ACCOUNT_VERIFICATION,
// 	});
// });
