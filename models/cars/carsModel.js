const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const { ERRORS } = require('@constants/tdb-constants');

const carsSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: [true, ERRORS.REQUIRED.COUNTRY_NAME],
    },
    province: {
      type: String,
      required: [true, ERRORS.REQUIRED.PROVINCE_NAME],
    },
    city: {
      type: String,
      required: [true, ERRORS.REQUIRED.CITY_NAME],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        // default: 'Point',
      },
      coordinates: [Number],
      address: String,
      required: false,
    },
    adType:{
      type: String,
      required: [true, ERRORS.REQUIRED.AD_TYPE_REQUIRED],
      enum: {
        values: ['Sell', 'Rental'],
        message: ERRORS.INVALID.INVALID_CONDITION,
      },
    },
    rentType:{
      type: String,
      enum:{
        values: ["Daily", "Weekly", "Monthly"],
        message: ERRORS.INVALID.INVALID_CONDITION,
      }
    },
    rentalCharge:{
      type: Number
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    image: [
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
    version: {
      type: String,
    },
    regNumber: {
      type: String,
      unique: true,
      index: true,
      validate: [
        validator.isAlphanumeric,
        `${ERRORS.INVALID.INVALID_REG_NUM}.${ERRORS.REQUIRED.APLHA_NUMERIC_REQUIRED}`,
      ],
      required: [true, ERRORS.REQUIRED.REG_NUMBER_REQUIRED],
    },
    model: {
      type: String,
      required: [true, ERRORS.REQUIRED.CAR_MODEL_REQUIRED],
    },
    modelYear: {
      type: Number,
      min: [1960, ERRORS.INVALID.INVALID_MODEL_YEAR],
      max: [Number(new Date().getFullYear()), ERRORS.INVALID.INVALID_MODEL_YEAR],
      required: [true, ERRORS.REQUIRED.MODEL_YEAR_REQUIRED],
    },
    make: {
      type: String,
      required: [true, ERRORS.REQUIRED.CAR_MAKE_REQUIRED],
    },
    price: {
      type: Number,
      min: [10000, ERRORS.INVALID.MINIMUM_PRICE],
      required: [true, ERRORS.REQUIRED.PRICE_REQUIRED],
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
    condition: {
      type: String,
      required: [true, ERRORS.REQUIRED.CONDITION_REQUIRED],
      enum: {
        values: ['Excellent', 'Good', 'Fair', 'Not Available'],
        message: ERRORS.INVALID.INVALID_CONDITION,
      },
    },
    bodyType: {
      type: String,
      required: [true, ERRORS.REQUIRED.BODY_TYPE_REQUIRED],
      trim: true,
    },
    bodyColor: {
      type: String,
      required: [true, ERRORS.REQUIRED.BODY_COLOR_REQUIRED],
    },
    engineCapacity: {
      type: Number,
      min: [200, ERRORS.INVALID.MINIMUM_ENGINE_CAPACITY],
      required: [true, ERRORS.REQUIRED.ENGINE_CAPACITY_REQUIRED],
    },
    registrationCity: {
      type: String,
      trim: true,
      required: [true, ERRORS.REQUIRED.REGISTRATION_CITY],
    },
    milage: {
      type: Number,
      required: [true, ERRORS.REQUIRED.MILAGE_REQUIRED],
    },
    assembly: {
      type: String,
      required: [true, ERRORS.REQUIRED.ASSEMBLY_REQUIRED],
      enum: {
        values: ['Local', 'Imported', 'Not Available'],
        message: ERRORS.INVALID.INVALID_ASSEMBLY,
      },
    },
    features: [{ type: String, required: [true, ERRORS.REQUIRED.FEATURES_REQUIRED] }],
    description: {
      type: String,
      required: [true, ERRORS.REQUIRED.DESCRIPTION_REQUIRED],
    },
    favOf: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    associatedPhone: {
      type: String,
      validate: [validator.isMobilePhone, ERRORS.INVALID.INVALID_PHONE_NUM],
    },
    soldByUs: {
      type: Boolean,
    },
    isFav: {
      type: Boolean,
      default: undefined,
    },
    isSold: {
      type: Boolean,
      index: true,
      default: false,
    },
    active: {
      type: Boolean,
      index: true,
      default: true,
    },
    sellerType: {
      type: String,
      required: [true, ERRORS.REQUIRED.SELLER_TYPE_REQUIRED],
      enum: {
        values: ['Dealer', 'Individual', 'Not Available'],
        message: ERRORS.INVALID.INVALID_SELLER_TYPE,
      },
    },
    banned: {
      type: Boolean,
      index: true,
      default: false,
    },
    imageStatus: {
      type: Boolean,
    },
    views: {
      type: Number,
      default: 0,
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

    slug: {
      type: String,
      unique: true,
    },
    isPublished: {
      type: Boolean,
    },
    publishedDate: {
      type: Date,
    },
    accidental: {
      type: String,
      enum: {
        values: ['Yes', 'No'],
        message: 'Accidental should be either Yes or No',
      },
    },
    batteryCondition: {
      type: String,
      enum: {
        values: ['New', 'Used', 'Damaged'],
        message: 'Battery condition should be either New, Used or Damaged',
      },
    },
    vehicleCertified: {
      type: String,
      enum: {
        values: ['Yes', 'No'],
        message: 'Vehicle certificate should be either Yes or No',
      },
    },
    InsuranceType: {
      type: String,
      enum: {
        values: [
          'Liability Coverage',
          'Comprehensive',
          'Collision',
          'Third Party',
          'Uninsured Motorist Insurance',
          'Underinsured Motorist Insurance',
          'Medical Payments Coverage',
          'Personal Injury Protection Insurance',
          'Gap Insurance',
          'Towing and Labor Insurance',
          'Rental Reimbursement Insurance',
          'Classic Car Insurance',
          'None',
        ],
        message: `Insurance type should be either "Comprehensive", "Collision", "Third Party", "Liability Coverage", "Uninsured Motorist Insurance", "Underinsured Motorist Insurance", "Medical Payments Coverage", "Personal Injury Protection Insurance", "Gap Insurance", "Towing and Labor Insurance", "Rental Reimbursement Insurance", "Classic Car Insurance" or "None`,
      },
    },
    exchange: {
      type: String,
      enum: {
        values: ['Yes', 'No'],
        message: 'Exchange should be either Yes or No',
      },
    },
    finance: {
      type: String,
      enum: {
        values: ['Yes', 'No'],
        message: 'Finance should be either Yes or No',
      },
    },
    tyreCondition: {
      type: String,
      enum: {
        values: ['New', 'Used', 'Damaged'],
        message: 'Exchange should be either New, Used or Damaged',
      },
    },
    serviceHistory: {
      type: String,
      enum: {
        values: ['Available', 'Not Available'],
        message: 'Service history should be either Available or Not Available',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

carsSchema.index({ active: -1, isSold: 1, banned: 1 });
carsSchema.index({ location: '2dsphere' });

carsSchema.index({
  country: 'text',
  province: 'text',
  city: 'text',
  model: 'text',
  make: 'text',
  bodyColor: 'text',
  engineType: 'text',
  condition: 'text',
  bodyType: 'text',
  assembly: 'text',
  transmission: 'text',
});

carsSchema.pre('save', async function (next) {
  if (
    this.isModified('bodyColor ') ||
    this.isModified('make') ||
    this.isModified('model') ||
    this.isModified('city') ||
    this.isModified('modelYear') ||
    this.isNew
  ) {
    this.slug = slugify(
      `${this.bodyColor}-${this.make}-${this.model}-in-${this.city}-${this.modelYear}-${this._id}`,
    );
  }
  next();
});
// carsSchema.pre('save', function (next) {
//   if (this.isNew && Array.isArray(this.location) && 0 === this.location.length) {
//     this.location = undefined;
//   }
//   next();
// })

const Car = mongoose.model('Car', carsSchema);

module.exports = Car;
