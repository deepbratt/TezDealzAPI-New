const Users = require('../../../models/user/userModel');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { ERRORS, STATUS_CODE, SUCCESS_MSG, STATUS } = require('@constants/tdb-constants');
const { uploadS3 } = require('@utils/tdb_globalutils');
const { filterObj } = require('../factory/factoryHandler');

// To filter unwanted fields from req.body
exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user tying to change/update passowrd data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError(ERRORS.INVALID.INVALID_ROUTE, STATUS_CODE.BAD_REQUEST));
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
  if (req.user.signedUpWithEmail) {
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
  } else if (req.user.signedUpWithPhone) {
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

  // Update User document
  const user = await Users.findByIdAndUpdate(req.user.id, filteredBody, {
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

// User can also delete/inactive himself
exports.deleteMe = catchAsync(async (req, res, next) => {
  await Users.findByIdAndUpdate(req.user._id, { active: false });

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.USER_DELETED,
  });
});
