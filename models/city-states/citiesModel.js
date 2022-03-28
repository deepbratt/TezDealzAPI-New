const mongoose = require('mongoose');

const citiesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    stateCode: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
  },
  { timestamps: true },
);

const Cities = mongoose.model('Cities', citiesSchema);

module.exports = Cities;
