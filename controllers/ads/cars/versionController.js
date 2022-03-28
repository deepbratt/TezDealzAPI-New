const CarVersion = require('../../../models/cars/make-model/car_version');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { filter } = require('../../users/factory/factoryHandler');

// VERSIONS //////////////////////////////////
exports.getVersions = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(CarVersion.find(), req.query);
  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_CAR_VERSIONS,
    totalCount: totalCount,
    countOnPage: result.length,
    data: {
      result,
    },
  });
});

exports.addVersion = catchAsync(async (req, res, next) => {
  const result = await CarVersion.create(req.body);

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.CAR_VERSION_ADDED,
    data: {
      result,
    },
  });
});

exports.updateVersion = catchAsync(async (req, res, next) => {
  const result = await CarVersion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE_CAR_VERSION,
    data: {
      result,
    },
  });
});

exports.removeVersion = catchAsync(async (req, res, next) => {
  const result = await CarVersion.findById(req.params.id);
  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  await CarVersion.findByIdAndDelete(req.params.id);
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE_CAR_VERSION,
    data: null,
  });
});
