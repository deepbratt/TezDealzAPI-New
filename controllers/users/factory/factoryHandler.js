const { APIFeatures, catchAsync } = require('@utils/tdb_globalutils');

exports.filter = async (query, queryParams) => {
  const results = new APIFeatures(query, queryParams).filter().search().sort().limitFields();
  const totalCount = await results.query.count();

  const freatures = new APIFeatures(query, queryParams)
    .filter()
    .search()
    .sort()
    .limitFields()
    .pagination();
  const doc = await freatures.query;

  return [doc, totalCount];
};

exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.stats = (Model) => {
  return catchAsync(async (req, res, next) => {
    const stats = await Model.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    res.status(200).json({
      status: STATUS.SUCCESS,
      data: {
        stats,
      },
    });
  });
};

exports.dailyAggregate = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { min, max } = req.params;
    const stats = await Model.aggregate([
      {
        $match: {
          createdAt: { $lte: moment(max).toDate(), $gte: moment(min).toDate() },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          date: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);
    res.status(200).json({
      status: STATUS.SUCCESS,
      data: stats,
    });
  });
};

exports.citiesByProvince = (Model) => {
  return catchAsync(async (req, res, next) => {
    let array = [
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          city: '$_id',
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];
    if (req.query.province) {
      array.unshift({ $match: filter(req.query) });
    }
    const result = await Model.aggregate(array);
    res.status(200).json({
      status: STATUS.SUCCESS,
      data: {
        result,
      },
    });
  });
};