const Cities = require('../../../models/city-states/citiesModel');
const States = require('../../../models/city-states/statesModel');
const { filter } = require('../../users/factory/factoryHandler');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');

exports.getAllStates = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(States.find(), req.query);

  if (result[0].length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  console.log(result.length);

  res.status(200).json({
    status: STATUS.SUCCESS,
    message: 'List of all States',
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getStateByCode = catchAsync(async (req, res, next) => {
  const result = await States.find({ isoCode: req.params.stateCode });

  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(200).json({
    status: STATUS.SUCCESS,
    message: 'List of all states by code',
    countOnPage: result.length,
    data: {
      result,
    },
  });
});

exports.getStateByCodeAndCountry = catchAsync(async (req, res, next) => {
  var state_code = req.params.stateCode;
  var country_code = req.params.countryCode;

  const result = await States.find({ countryCode: country_code, isoCode: state_code });

  if (result[0].length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(200).json({
    status: STATUS.SUCCESS,
    message: 'State data by state and country code',
    countOnPage: result.length,
    data: {
      result,
    },
  });
});

exports.getStatesOfCountry = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(
    States.find({ countryCode: req.params.countryCode }),
    req.query,
  );

  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(200).json({
    status: STATUS.SUCCESS,
    message: 'List of all states by country code',
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getAllCities = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(Cities.find(), req.query);

  if (result[0].length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(200).json({
    status: STATUS.SUCCESS,
    message: 'List of all cities',
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getCitiesOfState = catchAsync(async (req, res, next) => {
  var countryCode_f = req.params.countryCode;
  var stateCode_f = req.params.stateCode;

  const [result, totalCount] = await filter(
    Cities.find({ stateCode: stateCode_f, countryCode: countryCode_f }),
    req.query,
  );

  if (result[0].length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(200).json({
    status: STATUS.SUCCESS,
    message: 'All cities of states',
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getCitiesOfCountry = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(Cities.find({ countryCode: 'PK' }), req.query);

  if (result[0].length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(200).json({
    status: STATUS.SUCCESS,
    message: 'All cities of country',
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});
