const mongoose = require('mongoose');

const bulkUploadSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    csvFile: {
      type: String,
      // required: [true, 'Please Add a file'],
    },
    successAdsCount: {
      type: Number,
    },
    failedAdsCount: {
      type: Number,
    },
    totalAdsCount: {
      type: Number,
    },
    failedAds: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const BulkUploads = mongoose.model('BulkUploads', bulkUploadSchema);

module.exports = BulkUploads;
