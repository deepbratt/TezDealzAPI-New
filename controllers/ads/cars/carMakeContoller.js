const CarMake = require('../../../models/cars/make-model/car_make');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { filter } = require('../../users/factory/factoryHandler');

exports.createMake = catchAsync(async (req, res, next) => {
  const result = await CarMake.create(req.body);
  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.CAR_MAKE_CREATED,
    data: {
      result,
    },
  });
});

exports.getAllMakes = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(CarMake.find(), req.query);

  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_CAR_MAKES,
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getOneMake = catchAsync(async (req, res, next) => {
  const result = await CarMake.findById(req.params.id);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ONE_CAR_MAKE,
    data: {
      result,
    },
  });
});

exports.updateMake = catchAsync(async (req, res, next) => {
  const result = await CarMake.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (req.body.make_id) {
    return next(new AppError(ERRORS.INVALID.MAKE_ID_UPDATE, STATUS_CODE.BAD_REQUEST));
  }

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE_CAR_MAKE,
    data: {
      result,
    },
  });
});

exports.deleteMake = catchAsync(async (req, res, next) => {
  const result = await CarMake.findByIdAndDelete(req.params.id);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE_CAR_MAKE,
  });
});
