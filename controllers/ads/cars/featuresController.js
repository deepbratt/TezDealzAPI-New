const Features = require('../../../models/cars/features/featuresModel');
const { AppError, catchAsync, uploadS3 } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { filter } = require('../../users/factory/factoryHandler');

exports.createFeature = catchAsync(async (req, res, next) => {
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

  const result = await Features.create(req.body);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.CAR_FEATURE_CREATE,
    data: {
      result,
    },
  });
});

exports.getAllFeatures = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(Features.find(), req.query);

  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_CAR_FEATURES,
    totalCount: totalCount,
    countOnpage: result.length,
    data: {
      result,
    },
  });
});

exports.getOneFeature = catchAsync(async (req, res, next) => {
  const result = await Features.findById(req.params.id);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ONE_CAR_FEATURE,
    data: {
      result,
    },
  });
});

exports.UpdateOneFeature = catchAsync(async (req, res, next) => {
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
  const result = await Features.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE_CAR_FEATURE,
    data: {
      result,
    },
  });
});

exports.deleteFeature = catchAsync(async (req, res, next) => {
  const result = await Features.findByIdAndDelete(req.params.id);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE_CAR_FEATURE,
  });
});
