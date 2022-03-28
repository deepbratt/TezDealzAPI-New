const mongoose = require('mongoose');

const carversions = new mongoose.Schema(
  {
    model_id: {
      type: Number,
      index: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    capacity: {
      type: Number,
    },
    fuel_type: {
      type: String,
    },
    transmission_type: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

carversions.index({ model_id: 1, name: 1, capacity: 1, fuel_type: 1, transmission_type: 1 });
carversions.index({ name: 'text', capacity: 'text', fuel_type: 'text', transmission_type: 'text' });

const CarVersion = mongoose.model('CarVersion', carversions);
module.exports = CarVersion;
