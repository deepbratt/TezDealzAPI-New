const Car = require('../../../models/cars/carsModel');
// const User = require('../../models/user/userModel');
const ShowNumber = require('../../../models/cars/number-viewed/showNumberModel');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { filter } = require('../../users/factory/factoryHandler');

exports.createShowNumberDetails = catchAsync(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  const details = {
    seller_details: car.createdBy,
    buyer_details: req.user._id,
    car_details: car._id,
  };

  if (
    !(await ShowNumber.findOne({
      seller_details: car.createdBy,
      buyer_details: req.user._id,
      car_details: car._id,
    }))
  ) {
    const result = await ShowNumber.create(details);

    res.status(STATUS_CODE.CREATED).json({
      status: STATUS.SUCCESS,
      message: SUCCESS_MSG.SUCCESS_MESSAGES.CAR_SHOW_NUMBER_CREATE,
      data: {
        result,
      },
    });
  } else {
    res.status(STATUS_CODE.OK).json({
      status: STATUS.SUCCESS,
      message: 'Details Already Saved',
    });
  }
});

exports.getAllShowNumberData = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(
    ShowNumber.find().populate([
      {
        path: 'buyer_details',
        model: 'User',
        select: 'firstName lastName phone',
      },
      {
        path: 'car_details',
        model: 'Car',
        select: 'make model modelYear',
      },
    ]),
    req.query,
  );

  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_CAR_SHOW_NUMBERS,
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getOneShowNumberDetail = catchAsync(async (req, res, next) => {
  const result = await ShowNumber.findById(req.params.id).populate([
    {
      path: 'buyer_details',
      model: 'User',
    },
    {
      path: 'car_details',
      model: 'Car',
    },
    {
      path: 'seller_details',
      model: 'User',
    },
  ]);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ONE_CAR_SHOW_NUMBER,
    data: {
      result,
    },
  });
});

exports.updateShowNumberDetails = catchAsync(async (req, res, next) => {
  const result = await ShowNumber.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE_CAR_SHOW_NUMBER,
    data: {
      result,
    },
  });
});

exports.deleteShowNumberDetails = catchAsync(async (req, res, next) => {
  const result = await ShowNumber.findByIdAndDelete(req.params.id);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE_CAR_SHOW_NUMBER,
  });
});

exports.getAllLogsOfOneAd = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(
    ShowNumber.find({ car_details: req.params.id }).populate([
      {
        path: 'buyer_details',
        model: 'User',
        select: 'firstName lastName phone',
      },
      {
        path: 'car_details',
        model: 'Car',
        select: 'make model modelYear',
      },
    ]),
    req.query,
  );

  if (!result) return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_LOGS_OF_ONE_AD,
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

// exports.addToShowNumberOfAd = catchAsync(async (req, res, next) => {
//   if (!(await Car.findById(req.params.id))) {
//     return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
//   }

//   if (req.user.showNumberOfAd.includes(req.params.id)) {
//     res.status(STATUS_CODE.OK).json({
//       status: STATUS.SUCCESS,
//       message: 'This Add ID is Already Added',
//     });
//   } else {
//     await User.updateOne({ _id: req.user._id }, { $push: { showNumberOfAd: req.params.id } });

//     res.status(STATUS_CODE.OK).json({
//       status: STATUS.SUCCESS,
//       message: 'Details Added of this Ad!!!',
//     });
//   }
// });
