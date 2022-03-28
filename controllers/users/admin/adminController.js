const Validator = require('email-validator');
const crypto = require('crypto');
const User = require('../../../models/user/userModel');
const moment = require('moment');
const { AppError, catchAsync, uploadS3 } = require('@utils/tdb_globalutils');
const { ERRORS, STATUS_CODE, SUCCESS_MSG, STATUS, ROLES } = require('@constants/tdb-constants');
const { regex, pakPhone } = require('../../../utils/regex');
const { send } = require('../../../utils/rabbitMQ');
const { filterObj, filter } = require('../factory/factoryHandler');
const sendSMS = require('../../../utils/sendSMS');
const Email = require('../../../utils/email-mailgun');
exports.getAllUsers = catchAsync(async (req, res, next) => {
  let result;
  if (req.user.role === ROLES.USERROLES.ADMIN) {
    result = await filter(User.find(), req.query);
  } else {
    result = await filter(User.find({ role: ROLES.USERROLES.INDIVIDUAL }), req.query);
  }
  if (result[0].length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_USERS,
    countOnPage: result[0].length,
    totalCount: result[1],
    data: {
      result: result[0],
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const result = await User.findById(req.params.id);
  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  if (req.user.role !== ROLES.USERROLES.ADMIN && result.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ONE_USER,
    data: {
      result,
    },
  });
});

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const result = await User.findById(req.params.id);
  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  if (req.user.role !== ROLES.USERROLES.ADMIN && result.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  // Image Upload
  if (req.files.image) {
    let { Location } = await uploadS3(
      req.files.image[0],
      process.env.AWS_BUCKET_REGION,
      process.env.AWS_ACCESS_KEY,
      process.env.AWS_SECRET_KEY,
      process.env.AWS_BUCKET_NAME,
    );
    req.body.image = Location;
  }

  if (req.files.bannerImage) {
    let { Location } = await uploadS3(
      req.files.bannerImage[0],
      process.env.AWS_BUCKET_REGION,
      process.env.AWS_ACCESS_KEY,
      process.env.AWS_SECRET_KEY,
      process.env.AWS_BUCKET_NAME,
    );
    req.body.bannerImage = Location;
  }

  // filter out fileds that cannot be updated e.g Role etc
  let filteredBody;
  if (result.signedUpWithEmail) {
    filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'phone',
      'image',
      'bannerImage',
      'about',
      'description',
      'gender',
      'country',
      'city',
      'dateOfBirth',
    );
  } else if (result.signedUpWithPhone) {
    filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'email',
      'image',
      'bannerImage',
      'about',
      'description',
      'gender',
      'country',
      'city',
      'dateOfBirth',
    );
  }
  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    runValidators: true,
    new: true,
  });

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.PROFILE_UPDATED_SUCCESSFULLY,
    result: {
      user,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.PASSWORD_CHANGED,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const result = await User.findById(req.params.id);
  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  if (req.user.role !== ROLES.USERROLES.ADMIN && result.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.USER_DELETED,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  let user;
  if (req.user.role !== ROLES.USERROLES.ADMIN && req.body.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
  }
  if (Validator.validate(req.body.data)) {
    user = await User.create({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email: req.body.data,
      role: req.body.role,
      username: req.body.username,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      signedUpWithEmail: true,
    });
    await new Email(user.email, { ...user._doc }).welcomeDev();
  } else if (regex.pakPhone.test(req.body.data)) {
    user = await User.create({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      phone: req.body.data,
      username: req.body.username,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      signedUpWithPhone: true,
    });
  } else {
    return next(
      new AppError(
        `${ERRORS.INVALID.INVALID_EMAIL} / ${ERRORS.INVALID.INVALID_PHONE}`,
        STATUS_CODE.BAD_REQUEST,
      ),
    );
  }
  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.USER_CREATED,
  });
});

exports.inactiveUser = catchAsync(async (req, res, next) => {
  const result = await User.findOne({ _id: req.params.id, active: true });
  if (!result) {
    return next(new AppError(ERRORS.INVALID.INACTIVE_USER, STATUS_CODE.BAD_REQUEST));
  }
  if (req.user.role !== ROLES.USERROLES.ADMIN && result.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
  }
  await User.updateOne({ _id: req.params.id }, { active: false });
  send('inactive_user', JSON.stringify({ createdBy: req.params.id }));
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.USER_INACTIVATED,
  });
});

// Active User By Admin or Moderator
exports.activeUser = catchAsync(async (req, res, next) => {
  const result = await User.findOne({ _id: req.params.id, active: false });
  if (!result) {
    return next(new AppError(ERRORS.INVALID.ACTIVE_USER, STATUS_CODE.BAD_REQUEST));
  }
  if (req.user.role !== ROLES.USERROLES.ADMIN && result.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
  }
  await User.updateOne({ _id: req.params.id }, { active: true });
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.USER_ACTIVATED,
  });
});

exports.unbanUser = catchAsync(async (req, res, next) => {
  const result = await User.findOne({ _id: req.params.id, banned: true });
  if (!result) {
    return next(new AppError(ERRORS.INVALID.UNBAN_USER, STATUS_CODE.BAD_REQUEST));
  }
  if (req.user.role !== ROLES.USERROLES.ADMIN && result.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
  }
  await User.updateOne({ _id: req.params.id }, { banned: false });
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UNBANNED_USER,
  });
});

exports.banUser = catchAsync(async (req, res, next) => {
  const result = await User.findOne({ _id: req.params.id, banned: false });
  if (!result) {
    return next(new AppError(ERRORS.INVALID.BAN_USER, STATUS_CODE.BAD_REQUEST));
  }
  if (req.user.role !== ROLES.USERROLES.ADMIN && result.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
  }
  await User.updateOne({ _id: req.params.id }, { banned: true });
  send('inactive_user', JSON.stringify({ createdBy: req.params.id }));
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.BANNED_USER,
  });
});

// User Statistics
exports.userStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: { $toUpper: '$role' },
        // _id: null,
        total: { $sum: 1 },
        Roles: { $push: '$role' },
      },
    },
    {
      $project: { _id: 1, total: 1 },
    },
    {
      $sort: { total: 1 },
    },
  ]);

  res.status(200).json({
    status: STATUS.SUCCESS,
    data: {
      stats,
    },
  });
});

// Stats of Users from one date to another
exports.dailyUserAggregate = catchAsync(async (req, res, next) => {
  const { min, max } = req.params;
  const stats = await User.aggregate([
    {
      $match: {
        createdAt: { $lte: moment(max).toDate(), $gte: moment(min).toDate() },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        userCreated: { $sum: 1 },
      },
    },
    {
      $addFields: {
        date: '$_id',
      },
    },
    {
      $project: {
        _id: 1,
        userCreated: 1,
      },
    },
    {
      $sort: {
        date: -1,
      },
    },
    // {
    //   $limit: 10,
    // },
  ]);
  res.status(200).json({
    status: STATUS.SUCCESS,
    data: {
      stats,
    },
  });
});

// Forgot Password Admin Panel
exports.forgotPasswordAdmin = catchAsync(async (req, res, next) => {
  if (!req.body.data) {
    return next(
      new AppError(
        `${ERRORS.REQUIRED.EMAIL_REQUIRED}/${ERRORS.REQUIRED.PHONE_REQUIRED}`,
        STATUS_CODE.BAD_REQUEST,
      ),
    );
  }
  let user;
  if (Validator.validate(req.body.data)) {
    user = await User.findOne({
      email: req.body.data,
      $or: [
        {
          role: ROLES.USERROLES.ADMIN,
        },
        {
          role: ROLES.USERROLES.MODERATOR,
        },
      ],
    });
  } else if (regex.pakPhone.test(req.body.data)) {
    user = await User.findOne({
      phone: req.body.data,
      $or: [
        {
          role: ROLES.USERROLES.ADMIN,
        },
        {
          role: ROLES.USERROLES.MODERATOR,
        },
      ],
    });
  }

  if (!user) {
    return next(
      new AppError(
        `${ERRORS.INVALID.INVALID_EMAIL}/${ERRORS.INVALID.INVALID_PHONE_NUM}`,
        STATUS_CODE.UNAUTHORIZED,
      ),
    );
  }

  const adminResetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    if (Validator.validate(req.body.data)) {
      await new Email(user.email, { ...user._doc, adminResetToken }).adminSendPasswordResetToken();
      return res.status(STATUS_CODE.OK).json({
        status: STATUS.SUCCESS,
        message: SUCCESS_MSG.SUCCESS_MESSAGES.TOKEN_SENT_EMAIL,
      });
    } else {
      await sendSMS({
        body: `Your TezDealz Admin Password reset code is ${adminResetToken}`,
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

exports.resetPasswordAdmin = catchAsync(async (req, res, next) => {
  const hashedTokenAdmin = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedTokenAdmin,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user || user.role === ROLES.USERROLES.INDIVIDUAL) {
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
