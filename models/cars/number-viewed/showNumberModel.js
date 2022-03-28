const mongoose = require('mongoose');

const showNumbers = new mongoose.Schema(
  {
    buyer_details: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    seller_details: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    car_details: {
      type: mongoose.Schema.ObjectId,
      ref: 'Car',
    },
    clickedDate: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  },
);

showNumbers.index({ buyer_details: 1, seller_details: 1, car_details: 1 });

showNumbers.index({
  buyer_details: 'text',
  seller_details: 'text',
  car_details: 'text',
});

const ShowNumber = mongoose.model('ShowNumber', showNumbers);

module.exports = ShowNumber;
