const mongoose = require('mongoose');

const statesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    isoCode: {
      type: String,
    },
    countryCode: {
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

const States = mongoose.model('States', statesSchema);

module.exports = States;
