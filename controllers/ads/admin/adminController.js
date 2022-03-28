const Car = require('../../../models/cars/carsModel');
const User = require('../../../models/user/userModel');
const fs = require('fs');
// const moment = require('moment');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { filter } = require('../../users/factory/factoryHandler');

exports.carOwners = catchAsync(async (req, res, next) => {
  const count = await Car.aggregate([
    {
      $facet: {
        total: [
          {
            $group: {
              _id: '$createdBy',
            },
          },
          {
            $project: { _id: 0, totalOwners: 0 },
          },
          {
            $count: 'count',
          },
        ],
        monthly: [
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'user_doc',
            },
          },
          {
            $unwind: '$user_doc',
          },
          {
            $match: {
              $expr: {
                $eq: [{ $year: '$user_doc.createdAt' }, { $year: new Date() }],
                $eq: [{ $month: '$user_doc.createdAt' }, { $month: new Date() }],
              },
            },
          },
          {
            $group: {
              _id: '$user_doc._id',
              owners: { $sum: 1 },
            },
          },
          {
            $count: 'count',
          },
        ],
        today: [
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'user_doc',
            },
          },
          {
            $unwind: '$user_doc',
          },
          {
            $match: {
              $expr: {
                $eq: [{ $year: '$user_doc.createdAt' }, { $year: new Date() }],
                $eq: [{ $month: '$user_doc.createdAt' }, { $month: new Date() }],
                $eq: [{ $dayOfMonth: '$user_doc.createdAt' }, { $dayOfMonth: new Date() }],
              },
            },
          },
          {
            $group: {
              _id: '$user_doc._id',
              owners: { $sum: 1 },
            },
          },
          {
            $count: 'count',
          },
        ],
      },
    },
  ]);

  res.status(200).json({
    status: STATUS.SUCCESS,
    data: {
      result: {
        total: count[0].total.length > 0 ? count[0].total[0].count : 0,
        monthly: count[0].monthly.length > 0 ? count[0].monthly[0].count : 0,
        today: count[0].today.length > 0 ? count[0].today[0].count : 0,
      },
    },
  });
});

exports.cars = catchAsync(async (req, res, next) => {
  const count = await Car.aggregate([
    {
      $facet: {
        total: [
          {
            $group: {
              _id: '$_id',
            },
          },
          {
            $project: { _id: 0, totalOwners: 0 },
          },
          {
            $count: 'count',
          },
        ],
        monthly: [
          {
            $match: {
              $expr: {
                $eq: [{ $year: '$createdAt' }, { $year: new Date() }],
                $eq: [{ $month: '$createdAt' }, { $month: new Date() }],
              },
            },
          },
          {
            $group: {
              _id: '$createdAt',
              carCreated: { $sum: 1 },
            },
          },
          {
            $count: 'count',
          },
        ],
        today: [
          {
            $match: {
              $expr: {
                $eq: [{ $year: '$createdAt' }, { $year: new Date() }],
                $eq: [{ $month: '$createdAt' }, { $month: new Date() }],
                $eq: [{ $dayOfMonth: '$createdAt' }, { $dayOfMonth: new Date() }],
              },
            },
          },
          {
            $group: {
              _id: '$_id',
              cars: { $sum: 1 },
            },
          },
          {
            $count: 'count',
          },
        ],
      },
    },
  ]);

  res.status(200).json({
    status: STATUS.SUCCESS,
    data: {
      result: {
        total: count[0].total.length > 0 ? count[0].total[0].count : 0,
        monthly: count[0].monthly.length > 0 ? count[0].monthly[0].count : 0,
        today: count[0].today.length > 0 ? count[0].today[0].count : 0,
      },
    },
  });
});

exports.views = catchAsync(async (req, res, next) => {
  const sum = await Car.aggregate([
    {
      $group: {
        _id: 'null',
        views: { $sum: '$views' },
      },
    },
  ]);
  const count = await Car.aggregate([
    {
      $group: {
        _id: '$make',
        views: { $sum: '$views' },
      },
    },
    {
      $project: {
        views: 1,
        percentage: {
          $round: [{ $multiply: [{ $divide: [100, sum[0].views] }, '$views'] }, 1],
        },
      },
    },
    {
      $addFields: {
        make: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        percentage: -1,
      },
    },
    {
      $limit: 3,
    },
  ]);

  res.status(200).json({
    status: STATUS.SUCCESS,
    data: {
      result: count,
    },
  });
});

// Total and montly cars sold percentage
exports.totalSoldCars = catchAsync(async (req, res, next) => {
  const count = await Car.aggregate([
    {
      $facet: {
        total: [
          {
            $group: {
              _id: null,
              totalCars: { $sum: 1 },
              totalSold: { $sum: { $cond: ['$isSold', 1, 0] } },
            },
          },
          {
            $project: {
              _id: 0,
              totalCars: 1,
              percentage: {
                $round: [{ $multiply: [{ $divide: ['$totalSold', '$totalCars'] }, 100] }, 1],
              },
              totalSold: 1,
            },
          },
        ],
        monthly: [
          {
            $match: {
              $expr: {
                $eq: [{ $year: '$createdAt' }, { $year: new Date() }],
                $eq: [{ $month: '$createdAt' }, { $month: new Date() }],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalCars: { $sum: 1 },
              totalSoldThisMonth: { $sum: { $cond: ['$isSold', 1, 0] } },
            },
          },
          {
            $project: {
              _id: 0,
              totalCars: 1,
              percentage: {
                $round: [
                  { $multiply: [{ $divide: ['$totalSoldThisMonth', '$totalCars'] }, 100] },
                  1,
                ],
              },
              totalSoldThisMonth: 1,
            },
          },
        ],
      },
    },
  ]);
  res.status(200).json({
    status: STATUS.SUCCESS,
    data: {
      result: {
        total: count[0].total.length > 0 ? count[0].total[0] : 0,
        monthly: count[0].monthly.length > 0 ? count[0].monthly[0] : 0,
      },
    },
  });
});

// Total and montly cars sold by platform percentage
exports.carsSoldByPlatform = catchAsync(async (req, res, next) => {
  const percentage = await Car.aggregate([
    {
      $facet: {
        total: [
          {
            $group: {
              _id: null,
              totalCars: { $sum: 1 },
              totalSoldByPlatform: { $sum: { $cond: ['$soldByUs', 1, 0] } },
            },
          },
          {
            $project: {
              _id: 0,
              totalCars: 1,
              percentage: {
                $round: [
                  {
                    $multiply: [{ $divide: ['$totalSoldByPlatform', '$totalCars'] }, 100],
                  },
                  1,
                ],
              },
              totalSoldByPlatform: 1,
            },
          },
        ],
        monthly: [
          {
            $match: {
              $expr: {
                $eq: [{ $year: '$createdAt' }, { $year: new Date() }],
                $eq: [{ $month: '$createdAt' }, { $month: new Date() }],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalCars: { $sum: 1 },
              totalSoldByPlatformThisMonth: { $sum: { $cond: ['$soldByUs', 1, 0] } },
            },
          },
          {
            $project: {
              _id: 0,
              totalCars: 1,
              percentage: {
                $round: [
                  {
                    $multiply: [{ $divide: ['$totalSoldByPlatformThisMonth', '$totalCars'] }, 100],
                  },
                  1,
                ],
              },
              totalSoldByPlatformThisMonth: 1,
            },
          },
        ],
      },
    },
  ]);
  res.status(200).json({
    status: STATUS.SUCCESS,
    data: {
      result: {
        total: percentage[0].total.length > 0 ? percentage[0].total[0] : 0,
        monthly: percentage[0].monthly.length > 0 ? percentage[0].monthly[0] : 0,
      },
    },
  });
});

exports.getAllOwners = catchAsync(async (req, res, next) => {
  const seller = await Car.distinct('createdBy');
  const [result, totalCount] = await filter(User.find({ _id: { $in: [...seller] } }), req.query);

  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_CAR_OWNERS,
    totalCount: totalCount,
    countOnPage: result.length,
    data: {
      result,
    },
  });
});

exports.getUploadStatus = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: STATUS.SUCCESS,
    data: {
      result: {
        userID: '',
        createdBy: '',
        s3referenceID: '',
        successCount: '',
        failedCount: '',
        status: '',
      },
    },
  });
});
