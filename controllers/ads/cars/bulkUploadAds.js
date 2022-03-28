const Car = require('../../../models/cars/carsModel');
const BulkUploads = require('../../../models/bulkUploads/bulkUploads');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const fastcsv = require('fast-csv');
const { uploadFile } = require('../../../utils/fileUpload');
const { filter } = require('../../users/factory/factoryHandler');
const { Exception } = require('../../../constants/messages');
const { json } = require('express');

const validateAdsCSVTemplate = async (req, next) => {
  return new Promise((resolve, reject) => {
    var csvValidationResult = {};
    var missingFields = [];
    var uploadData = [];
    var result = { isValid: true, message: '', failureReason: '', misingFields: '', data: [] };
    fastcsv
      .parseString(req.file.buffer, { headers: true })
      .validate(function (row, cb) {
        if (row.country === '') missingFields.push('Please add country name');
        if (row.province === '') missingFields.push('Please add province name');
        if (row.city === '') missingFields.push('Please add city name');
        if (row.version === '') missingFields.push('Please add version of car');
        if (row.regNumber === '') missingFields.push('Please add Registration Number of car');
        if (row.model === '') missingFields.push('Please add model of car');
        if (row.make === '') missingFields.push('Please add make of car');
        if (row.price === '') missingFields.push('Please add price of car');
        if (row.engineType === '') missingFields.push('Please add engine type of car');
        if (row.transmission === '') missingFields.push('Please add transmission of car');
        if (row.condition === '') missingFields.push('Please add condition of car');
        if (row.bodyType === '') missingFields.push('Please add body ype of car');
        if (row.bodyColor === '') missingFields.push('Please add body color of car');
        if (row.engineCapacity === '') missingFields.push('Please add engine Capacity of car');
        if (row.registrationCity === '') missingFields.push('Please add registration City of car');
        if (row.milage === '') missingFields.push('Please add milage of car');
        if (row.assembly === '') missingFields.push('Assembly should be Local or Imported');
        if (row.description === '') missingFields.push('Please add description of car');
        if (row.sellerType === '') missingFields.push('Seller Type should be Dealer or Individual');

        // Add all other field validations
        if (missingFields.length > 0) {
          var unique = missingFields.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
          });
          return cb(null, false, unique.join(', '));
        } else {
          return cb(null, true);
        }
      })
      .on('data', (data) => {
        // you can format data in this point
        uploadData.push(data);
      })
      .on('data-invalid', (row, rowNumber, reason) => {
        if (reason) {
          console.log(
            `${req.file.originalname} is invalid file. Invalid [rowNumber=${rowNumber}] `,
          );

          result.isValid = false;
          result.message = ` ${req.file.originalname} is invalid file. Invalid [rowNumber=${rowNumber}]  `;
          result.misingFields = reason;
        }
      })
      .on('end', () => {
        result.data = uploadData;
        csvValidationResult = result;
        resolve(csvValidationResult);
      });
  });
};

const checkDuplicateRegNumbersInCSV = (data) => {
  let isDuplicate = false,
    testObject = {};
  data.map(function (item) {
    var itemPropertyName = item['regNumber'];
    if (itemPropertyName in testObject) {
      testObject[itemPropertyName].duplicate = true;
      item.duplicate = true;
      isDuplicate = true;
    } else {
      testObject[itemPropertyName] = item;
      delete item.duplicate;
    }
  });
  return isDuplicate;
};

const dataValidation = async (data, userId) => {
  let validRecords = [],
    failedRecords = [];
  for (var i = 0; i < data.length; i++) {
    let adDetail = data[i];
    let isValidAd = true;
    let failedReason = [];
    const isExist = await Car.find({ regNumber: adDetail.regNumber });
    if (isExist.length > 0) {
      isValidAd = false;
      failedReason.push('Register number already exist in the system');
    }
    //Can include anyother data validations
    // .
    // /
    if (!isValidAd) {
      adDetail.failedReason = failedReason;
      failedRecords.push(adDetail);
    } else {
      adDetail.createdBy = userId;
      adDetail.imageStatus = false;
      adDetail.isPublished = false;
      validRecords.push(adDetail);
    }
  }
  return { validRecords, failedRecords };
};

const processBulkUpload = async (userId, data, bulkUploadRefId) => {
  try {
    const { validRecords, failedRecords } = await dataValidation(data, userId);
    await Car.create(validRecords);
    await BulkUploads.updateOne(
      {
        _id: bulkUploadRefId,
      },
      {
        $set: {
          successAdsCount: validRecords.length,
          failedAdsCount: failedRecords.length,
          failedAds: JSON.stringify(failedRecords),
          status: 'completed',
        },
      },
    );
  } catch (ex) {
    console.log('Bulk upload process failed');
    await BulkUploads.updateOne(
      {
        _id: bulkUploadRefId,
      },
      {
        $set: {
          status: 'failed',
        },
      },
    );
  }
};

exports.createBulkUploadAds = catchAsync(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please insert a CSV File to add data', STATUS_CODE.BAD_REQUEST));
    }
    const csvValidationResult = await validateAdsCSVTemplate(req, next);
    if (csvValidationResult.data.length <= 0) {
      return next(
        new AppError(
          'No Data available to insert!!! Please add data in CSV File to create records',
          STATUS_CODE.BAD_REQUEST,
        ),
      );
    }

    if (csvValidationResult.isValid) {
      const isDuplicate = checkDuplicateRegNumbersInCSV(csvValidationResult.data);
      if (!isDuplicate) {
        const file = req.file;
        const { Location } = await uploadFile(file);
        const result = await BulkUploads.create({
          csvFile: Location,
          createdBy: req.user._id,
          userId: req.params.id,
          status: 'inprogress',
          totalAdsCount: csvValidationResult.data.length,
        });
        res.status(STATUS_CODE.CREATED).json({
          status: STATUS.SUCCESS,
          message: 'Initiated the bulkupload',
          data: {
            result,
          },
        });
        processBulkUpload(req.params.id, csvValidationResult.data, result._id);
      } else {
        const error = {
          code: 400,
          status: 'FAILED',
          message: 'Bad Request',
          err: 'File contains duplicate register numbers',
        };
        res.status(500);
        res.json(error);
      }
    } else {
      res.status(400);
      result = {
        code: 400,
        status: 'FAILED',
        message: 'Invalid CSV template',
        details: {
          failed: {
            fieldValidationResult: {
              csvUploaded: req.file.originalname,
              message: csvValidationResult.message,
              missingFields: csvValidationResult.misingFields,
              referenceId: referenceId,
            },
          },
        },
      };
    }
  } catch (ex) {
    console.log('Ads upload failed');
    const error = {
      code: 500,
      status: 'FAILED',
      message: Exception.GeneralError,
      err: ex.message,
    };
    res.status(500);
    res.json(error);
  }
});

exports.getAllBulkAds = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(BulkUploads.find(), req.query);

  if (!result || result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  const failedCount = await filter(BulkUploads.find({ failedAdsCount: { $gt: 0 } }), req.query);

  const successCount = totalCount - failedCount.length;

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    countOnPage: result.length,
    totalCount: totalCount,
    successcount: successCount,
    failedCount: failedCount.length,
    data: {
      result,
    },
  });
});

exports.getOneBulkAd = catchAsync(async (req, res, next) => {
  const result = await BulkUploads.findById(req.params.id);

  if (!result || result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    data: {
      result,
    },
  });
});

exports.UpdateBulkAd = catchAsync(async (req, res, next) => {
  const result = await BulkUploads.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!result || result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE,
    data: {
      result,
    },
  });
});

exports.deleteBulkAd = catchAsync(async (req, res, next) => {
  const result = await BulkUploads.findByIdAndDelete(req.params.id);

  if (!result || result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE,
  });
});

exports.getAllBulkUploadsOfUser = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(
    BulkUploads.find({ userId: req.params.id }).populate({
      path: 'createdBy',
      model: 'User',
      select: 'firstName lastName phone',
    }),
    req.query,
  );

  const failedCount = await filter(BulkUploads.find({ failedAdsCount: { $gt: 0 } }), req.query);
  console.log(failedCount.length);

  const successCount = totalCount - failedCount.length;
  console.log(successCount);

  if (result.length === 0)
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    countOnPage: result.length,
    totalCount,
    successcount: successCount,
    failedCount: failedCount.length,
    data: {
      result,
    },
  });
});
