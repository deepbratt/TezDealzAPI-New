const BodyType = require('../../../models/cars/bodyTypes/bodyTypes');
const { AppError, catchAsync, uploadS3 } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { filter } = require('../../users/factory/factoryHandler');

exports.createBodyType = catchAsync(async (req, res, next) => {
  if (req.file) {
    let { Location } = await uploadS3(
      req.file,
      process.env.AWS_BUCKET_REGION,
      process.env.AWS_ACCESS_KEY,
      process.env.AWS_SECRET_KEY,
      process.env.AWS_BUCKET_NAME,
    );
    req.body.image = Location;
  }

  const result = await BodyType.create(req.body);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.BODY_TYPE_CREATED,
    data: {
      result,
    },
  });
});

exports.getAllBodyTypes = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(BodyType.find(), req.query);

  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_BODY_TYPES,
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getOneBodyType = catchAsync(async (req, res, next) => {
  const result = await BodyType.findById(req.params.id);

  if (!result) return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ONE_BODY_TYPE_,
    data: {
      result,
    },
  });
});

exports.updateBodyType = catchAsync(async (req, res, next) => {
  if (req.file) {
    let { Location } = await uploadS3(
      req.file,
      process.env.AWS_BUCKET_REGION,
      process.env.AWS_ACCESS_KEY,
      process.env.AWS_SECRET_KEY,
      process.env.AWS_BUCKET_NAME,
    );
    req.body.image = Location;
  }

  const result = await BodyType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.BODY_TYPE_UPDATED,
    data: {
      result,
    },
  });
});

exports.deleteBodyType = catchAsync(async (req, res, next) => {
  const result = await BodyType.findByIdAndDelete(req.params.id);

  if (!result) {
    return new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND);
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.BODY_TYPE_DELETED,
  });
});
