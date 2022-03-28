const mongoose = require('mongoose');
const { ERRORS } = require('@constants/tdb-constants');

const featuresSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, ERRORS.REQUIRED.FEATURE_NAME],
    unique: true,
  },
  image: {
    type: String,
    required: [true, ERRORS.REQUIRED.FEATURE_IMAGE],
  },
});

const Features = mongoose.model('Features', featuresSchema);

module.exports = Features;
