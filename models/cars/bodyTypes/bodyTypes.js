const mongoose = require('mongoose');
const { ERRORS } = require('@constants/tdb-constants');

const bodyTypesSchema = new mongoose.Schema({
  bodyType: {
    type: String,
    unique: true,
    required: [true, ERRORS.REQUIRED.BODY_TYPE],
  },
  image: {
    type: String,
    required: true,
  },
});

const BodyType = mongoose.model('BodyType', bodyTypesSchema);
module.exports = BodyType;
