const multer = require('multer');
const { memoryStorage } = require('multer');
const { AppError } = require('@utils/tdb_globalutils');
const S3 = require('aws-sdk/clients/s3');
const { v4: uuidv4 } = require('uuid');

const bucketName = process.env.AWS_BUCKET_NAME_FOR_BULK_ADS;
const region = process.env.AWS_BUCKET_REGION_FOR_BULK_ADS;
const accessKeyId = process.env.AWS_ACCESS_KEY_FOR_BULK_ADS;
const secretAccessKey = process.env.AWS_SECRET_KEY_FOR_BULK_ADS;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
  correctClockSkew: true,
});

exports.uploadFile = async (file) => {
  let myFile = file.originalname.split('.');
  const ext = myFile[myFile.length - 1];
  const uploadParams = {
    Bucket: bucketName,
    Body: file.buffer,
    Key: `${uuidv4()}.${ext}`,
    CacheControl: 'max-age=86400',
    ContentType: file.mimetype,
  };

  const obj = await s3.upload(uploadParams).promise();
  // console.log(obj);
  // obj.Location = obj.Location.replace('s3.ap-south-1.amazonaws.com/', '');
  return obj;
};

exports.fileUpload = (mineType, myType) => {
  return multer({
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (file.mimetype.startsWith(mineType) || file.mimetype.startsWith(myType)) {
        callback(null, true);
      } else {
        callback(new AppError(`Not an ${mineType}  ! Please upload only ${mineType}`, 400), false);
      }
    },
  });
};

exports.upload = (mineType = 'none') => {
  return multer({
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (file.mimetype.startsWith(mineType) || mineType === 'none') {
        callback(null, true);
      } else {
        callback(new AppError(`Not an ${mineType} ! Please upload only ${mineType}`, 400), false);
      }
    },
  });
};
