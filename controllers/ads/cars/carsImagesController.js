const CarImages = require('../../../models/cars/carsImages/carsImagesModel');
const { AppError, catchAsync, s3WithTag } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS, ROLES } = require('@constants/tdb-constants');
const { filter } = require('../../users/factory/factoryHandler');

exports.imageUploader = catchAsync(async (req, res, next) => {
  let arrayOfImages = [];
  let selectedImage;

  if (req.files.selectedImage) {
    let { Location, Key } = await s3WithTag(
      req.files.selectedImage[0],
      process.env.AWS_BUCKET_REGION,
      process.env.AWS_ACCESS_KEY,
      process.env.AWS_SECRET_KEY,
      process.env.AWS_BUCKET_NAME,
    );
    selectedImage = { reference: Key, location: Location };
  }

  if (req.files.image) {
    for (var i = 0; i < req.files.image.length; i++) {
      let { Location, Key } = await s3WithTag(
        req.files.image[i],
        process.env.AWS_BUCKET_REGION,
        process.env.AWS_ACCESS_KEY,
        process.env.AWS_SECRET_KEY,
        process.env.AWS_BUCKET_NAME,
      );
      arrayOfImages.push({ reference: Key, location: Location });
    }
  }
  const result = await CarImages.create({
    createdBy: req.user._id,
    images: arrayOfImages,
    selectedImage: selectedImage,
  });

  res.status(STATUS_CODE.CREATED).json({
    stats: STATUS.SUCCESS,
    message: 'Images Uploaded Successfully',
    data: {
      result,
    },
  });
});

exports.getAllCarImages = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(CarImages.find(), req.query);

  if (!result || result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: 'List of all car images',
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getOneCarImage = catchAsync(async (req, res, next) => {
  const result = await CarImages.findById(req.params.id).populate({
    path: 'createdBy',
    model: 'User',
    select: 'firstName lastName phone',
  });

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: 'Car images against that specific id',
    data: {
      result,
    },
  });
});
