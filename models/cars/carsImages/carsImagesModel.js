const mongoose = require('mongoose');

const carImages = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    selectedImage: {
      _id: false,
      reference: {
        type: String,
      },
      location: {
        type: String,
      },
    },

    images: [
      {
        _id: false,
        reference: {
          type: String,
        },
        location: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const CarImages = mongoose.model('CarImages', carImages);

module.exports = CarImages;
