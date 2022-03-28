const Color = require('../../../models/cars/color/colorModel');
const { AppError, catchAsync, uploadS3 } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { filter } = require('../../users/factory/factoryHandler');

exports.createOne = catchAsync(async (req, res, next) => {
  const result = await Color.create(req.body);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.CAR_COLOR_CREATE,
    data: {
      result,
    },
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(Color.find(), req.query);

  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_CAR_COLORS,
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const result = await Color.findById(req.params.id);

  if (!result) return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ONE_CAR_COLOR,
    data: {
      result,
    },
  });
});

exports.updateOne = catchAsync(async (req, res, next) => {
  const result = await Color.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE_CAR_COLOR,
    data: {
      result,
    },
  });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const result = await Color.findByIdAndDelete(req.params.id);

  if (!result) {
    return new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND);
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE_CAR_COLOR,
  });
});
