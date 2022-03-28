const crypto = require('crypto');
var validator = require('email-validator');
const User = require('../../../models/user/userModel');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { ERRORS, STATUS_CODE, SUCCESS_MSG, STATUS, ROLES } = require('@constants/tdb-constants');
const sendSMS = require('../../../utils/sendSMS');
const jwtManagement = require('../../../utils/jwtManagement');
const { regex, pakPhone } = require('../../../utils/regex');
const Email = require('../../../utils/email-mailgun');
//Forgot Password Via Email/phone
exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.data) {
    return next(
      new AppError(
        `${ERRORS.REQUIRED.EMAIL_REQUIRED}/${ERRORS.REQUIRED.PHONE_REQUIRED}`,
        STATUS_CODE.BAD_REQUEST,
      ),
    );
  }
  let user;
  if (validator.validate(req.body.data)) {
    user = await User.findOne({
      email: req.body.data,
      role: ROLES.USERROLES.INDIVIDUAL,
    });
  } else if (regex.pakPhone.test(req.body.data)) {
    user = await User.findOne({ phone: req.body.data, role: ROLES.USERROLES.INDIVIDUAL });
  }

  if (!user) {
    return next(
      new AppError(
        `${ERRORS.INVALID.INVALID_EMAIL}/${ERRORS.INVALID.INVALID_PHONE_NUM}`,
        STATUS_CODE.UNAUTHORIZED,
      ),
    );
  }
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    if (validator.validate(req.body.data)) {
      await new Email(user.email, { ...user._doc, resetToken }).sendPasswordResetToken();
      return res.status(STATUS_CODE.OK).json({
        status: STATUS.SUCCESS,
        message: SUCCESS_MSG.SUCCESS_MESSAGES.TOKEN_SENT_EMAIL,
      });
    } else {
      await sendSMS({
        body: `Your TezDealz password reset code is ${resetToken}`,
        phone: user.phone, // Text this number
        from: process.env.TWILIO_PHONE_NUMBER, // From a valid Twilio number
      });
      return res.status(STATUS_CODE.OK).json({
        status: STATUS.SUCCESS,
        message: SUCCESS_MSG.SUCCESS_MESSAGES.TOKEN_SENT_PHONE,
      });
    }
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(ERRORS.RUNTIME.SENDING_TOKEN, STATUS_CODE.SERVER_ERROR));
  }
});

//Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  //const hashedToken = req.params.token;

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user || user.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.INVALID.INVALID_RESET_LINK, STATUS_CODE.BAD_REQUEST));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.PASSWORD_RESET,
  });
});

// Update Current User's Password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from user's collection
  const user = await User.findById(req.user.id).select('+password');

  // If user has GoogleId and FacebookId, then he cannot update Password
  if (user.googleId || user.facebookId) {
    return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
  }

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    // check if current user is correct
    return next(new AppError('Invalid Password', STATUS_CODE.UNAUTHORIZED));
  }

  // if User is correct then Update Current user's password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  jwtManagement.createSendJwtToken(user, STATUS_CODE.OK, req, res);
});
