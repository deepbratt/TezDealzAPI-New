const mongoose = require('mongoose');
const { ERRORS } = require('@constants/tdb-constants');

const LocationSchema = mongoose.Schema({
  city: String,
  province: String,
  address: String,
});

const AppointmentTimeSchema = mongoose.Schema({
  startTime: String,
  endTime: String,
})

const appointmentsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    ad_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Car',
    },
    carLocation: {
      type: LocationSchema,
      required: true,
    },
    inspectionLocation:{
      type: String,
      default: 'carlocation',
      enum: {
        values: ['carlocation', 'dealerlocation'],
        message: 'Please Enter Valid inspection location.',
      },
    },
    firstName: {
      type: String,
      required:true,
    },
    lastName: {
      type: String,
      required:true,
    },
    phone: {
      type: String,
      required:true,
    },
    userAvailability: {
      type: String,
    },
    alternativePhone: {
      type: String,
    },
    appointmentTime: {
      type: AppointmentTimeSchema,
    },
    appointmentDate:{
      type: String,
    },
    appointmentSlot:{
      type:String,
    },
    carModel: {
      type: String,
      required: [true, ERRORS.REQUIRED.CAR_MODEL_REQUIRED],
    },
    modelYear: {
      type: Number,
      min: [1960, ERRORS.INVALID.INVALID_MODEL_YEAR],
      max: [Number(new Date().getFullYear()), ERRORS.INVALID.INVALID_MODEL_YEAR],
      required: [true, ERRORS.REQUIRED.MODEL_YEAR_REQUIRED],
    },
    carMake: {
      type: String,
      required: [true, ERRORS.REQUIRED.CAR_MAKE_REQUIRED],
    },
    bodyColor: {
      type: String,
      required: [true, ERRORS.REQUIRED.BODY_COLOR_REQUIRED],
    },
    engineType: {
      type: String,
      required: [true, ERRORS.REQUIRED.ENGINE_TYPE_REQUIRED],
      trim: true,
    },
    transmission: {
      type: String,
      required: [true, ERRORS.REQUIRED.TRANSMISSION_TYPE_REQUIRED],
      enum: {
        values: ['Manual', 'Automatic'],
        message: ERRORS.INVALID.INVALID_TRANSMISSION_TYPE,
      },
    },
    mechanicAssigned: {
      type: Boolean,
      default: false,
    },
    mechanicName: {
      type: String,
    },
    mechanicPhone: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
      enum: {
        values: ['Pending', 'In-Progress', 'mechanic_assigned', 'report_generated', 'Rejected'],
        message: 'Please Enter Valid Status',
      },
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Appointments = mongoose.model('Appointments', appointmentsSchema);

module.exports = Appointments;
