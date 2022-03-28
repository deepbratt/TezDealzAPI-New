const mongoose = require('mongoose');

const carMake = new mongoose.Schema({
  make_id: {
    type: Number,
    index: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
});

carMake.index({ make_id: 1, name: 1 });
carMake.index({ name: 'text' });

carMake.pre('save', async function (next) {
  let randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * (999 - 10) + 10);
  } while (
    await CarMake.findOne({
      make_id: randomNumber,
    })
  );
  this.make_id = randomNumber;
  return randomNumber;
});

const CarMake = mongoose.model('CarMake', carMake);
module.exports = CarMake;
