const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const { ERRORS, ROLES } = require('@constants/tdb-constants');

const userSchema = new mongoose.Schema(
  {
    // facebookId: {
    // 	type: String,
    // },
    // googleId: {
    // 	type: String,
    // },
    // displayName: {
    // 	type: String,
    // },
    firstName: {
      type: String,
      minlength: 3,
      maxlength: 15,
      required: [true, ERRORS.REQUIRED.FIRSTNAME_REQUIRED],
      // validate: [validator.isAlpha, ERRORS.INVALID.INVALID_FIRSTNAME],
    },
    // middleName: {
    // 	type: String,
    // },
    lastName: {
      type: String,
      minlength: 3,
      maxlength: 15,
      required: [true, ERRORS.REQUIRED.LASTNAME_REQUIRED],
      validate: [validator.isAlpha, ERRORS.INVALID.INVALID_LASTNAME],
    },
    email: {
      type: String,
      lowercase: true,
      validate: [validator.isEmail, ERRORS.INVALID.INVALID_SIGNUP_CREDENTIALS],
    },
    phone: {
      type: String,
      validate: [validator.isMobilePhone, ERRORS.INVALID.INVALID_SIGNUP_CREDENTIALS],
    },
    username: {
      type: String,
      required: [true, ERRORS.REQUIRED.USERNAME_REQUIRED],
      minlength: [5, ERRORS.INVALID.USERNAME_LENGTH],
    },
    password: {
      type: String,
      minlength: [8, ERRORS.INVALID.PASSWORD_LENGTH],
      select: false,
    },
    passwordConfirm: {
      type: String,
      minlength: [8, ERRORS.INVALID.PASSWORD_LENGTH],
      select: false,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: ERRORS.INVALID.PASSWORD_MISMATCH,
      },
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female'],
      },
      message: ERRORS.INVALID.INVALID_GENDER,
    },
    country: {
      type: String,
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      lowercase: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date, // Format  => year-month-day
      trim: true,
    },
    image: {
      type: String,
    },
    signedUpWithEmail: {
      type: Boolean,
      default: false,
    },
    signedUpWithPhone: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: 'User',
      enum: {
        values: [ROLES.USERROLES.INDIVIDUAL, ROLES.USERROLES.MODERATOR, ROLES.USERROLES.ADMIN],
        message: ERRORS.INVALID.ROLE_SIGNUP,
      },
    },
    bannerImage: {
      type: String,
    },
    about: {
      type: String,
    },
    description: {
      type: String,
    },
    // isVerified: {
    // 	type: Boolean,
    // 	default: false,
    // isEmailVerified: {
    // 	type: Boolean,
    // 	default: false,
    // },
    // isPhoneVerified: {
    // 	type: Boolean,
    // 	default: false,
    // },
    // emailVerificationCode: {
    // 	type: String,
    // 	select: false,
    // },
    // phoneVerificationCode: {
    // 	type: String,
    // 	select: false,
    // },
    // emailVerificationTokenExpires: {
    // 	type: Date,
    // 	select: false,
    // },
    // phoneVerificationTokenExpires: {
    // 	type: Date,
    // 	select: false,
    // },
    // loggedInWithPhone: {
    // 	type: Boolean,
    // 	default: false,
    // },
    // loggedInWithEmail: {
    // 	type: Boolean,
    // 	default: false,
    // },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: Date,
    active: {
      type: Boolean,
      index: true,
      default: true,
    },
    banned: {
      type: Boolean,
      index: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

//indexes
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ active: -1, banned: 1 });
userSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  username: 'text',
  phone: 'text',
  role: 'text',
});

//pre save middleware (runs before data saved to db)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptjs.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// to check if user change password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
});

//SCHEMA METHODS
userSchema.methods.correctPassword = async function (candidatePassword, userpassword) {
  // Check Password Is Correct??
  return await bcryptjs.compare(candidatePassword, userpassword);
};

//CHANGED_PASSWORD_AFTER
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance Method to get Random 4-digit code
userSchema.methods.createPasswordResetToken = async function () {
  let resetToken;
  do {
    resetToken = Math.floor(Math.random() * (1000 - 9999 + 1) + 9999).toString();
  } while (
    await User.findOne({
      passwordResetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
    })
  );
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Email Verification Token
// userSchema.methods.emailVerificationToken = async function () {
//   let verificationToken;
//   do {
//     verificationToken = Math.floor(Math.random() * (100000 - 999999 + 1) + 999999).toString();
//   } while (
//     await User.findOne({
//       emailVerificationCode: crypto.createHash('sha256').update(verificationToken).digest('hex'),
//     })
//   );
//   this.emailVerificationCode = crypto.createHash('sha256').update(verificationToken).digest('hex');
//   this.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000;
//   return verificationToken;
// };

// Phone Verification Token
// userSchema.methods.phoneVerificationToken = async function () {
//   let verificationToken;
//   do {
//     verificationToken = Math.floor(Math.random() * (100000 - 999999 + 1) + 999999).toString();
//   } while (
//     await User.findOne({
//       phoneVerificationCode: crypto.createHash('sha256').update(verificationToken).digest('hex'),
//     })
//   );
//   this.phoneVerificationCode = crypto.createHash('sha256').update(verificationToken).digest('hex');
//   this.phoneVerificationTokenExpires = Date.now() + 10 * 60 * 1000;
//   return verificationToken;
// };

// To show only active true users in Users.find() query
// userSchema.pre(/^find/, function (next) {
//   // /^find/ find all that startsWith (find)
//   // this. points to current query
//   this.find({
//     active: {
//       $ne: false,
//     },
//   });
//   next();
// });

const User = mongoose.model('User', userSchema);
module.exports = User;
