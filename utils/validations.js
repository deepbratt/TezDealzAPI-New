const { check, validationResult } = require('express-validator');
const { ERRORS } = require('@constants/tdb-constants');

exports.validationFunction = async (req, res, next) => {
  const errors = validationResult(req);
  errors.type = 'expressValidationError';
  if (!errors.isEmpty()) {
    return next(errors);
  }
  next();
};
exports.addUser = [
  check('firstName', ERRORS.REQUIRED.FIRSTNAME_REQUIRED)
    .not()
    .isEmpty()
    .isAlpha()
    .withMessage(ERRORS.INVALID.INVALID_FIRSTNAME),
  check('lastName', ERRORS.REQUIRED.LASTNAME_REQUIRED)
    .not()
    .isEmpty()
    .isAlpha()
    .withMessage(ERRORS.INVALID.INVALID_LASTNAME),
  check('data', ERRORS.REQUIRED.EMAIL_OR_PHONE_REQUIRED).not().isEmpty(),
  check('role', ERRORS.REQUIRED.USER_ROLE_REQUIRED).not().isEmpty(),
  check('password', ERRORS.INVALID.PASSWORD_LENGTH)
    .isLength({ min: 8 })
    .custom((value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        // trow error if passwords do not match
        throw new Error(ERRORS.INVALID.PASSWORD_MISMATCH);
      } else {
        return value;
      }
    }),
];

exports.signupRules = [
  check('firstName', ERRORS.REQUIRED.FIRSTNAME_REQUIRED)
    .not()
    .isEmpty()
    .isAlpha()
    .withMessage(ERRORS.INVALID.INVALID_FIRSTNAME),
  check('lastName', ERRORS.REQUIRED.LASTNAME_REQUIRED)
    .not()
    .isEmpty()
    .isAlpha()
    .withMessage(ERRORS.INVALID.INVALID_LASTNAME),
  check('data', ERRORS.REQUIRED.EMAIL_OR_PHONE_REQUIRED).not().isEmpty(),
  check('password', ERRORS.INVALID.PASSWORD_LENGTH)
    .isLength({ min: 8 })
    .custom((value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        // trow error if passwords do not match
        throw new Error(ERRORS.INVALID.PASSWORD_MISMATCH);
      } else {
        return value;
      }
    }),
];

exports.changePassword = [
  check('password', ERRORS.INVALID.PASSWORD_LENGTH)
    .isLength({ min: 8 })
    .custom((value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        // trow error if passwords do not match
        throw new Error(ERRORS.INVALID.PASSWORD_MISMATCH);
      } else {
        return value;
      }
    }),
];
exports.updateMyPassword = [
  check('passwordCurrent', ERRORS.REQUIRED.CURRENT_PASSWORD).not().isEmpty(),
  check('password', ERRORS.INVALID.PASSWORD_LENGTH)
    .isLength({ min: 8 })
    .custom((value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        // trow error if passwords do not match
        throw new Error(ERRORS.INVALID.PASSWORD_MISMATCH);
      } else {
        return value;
      }
    }),
];

// exports.signupEmailRules = [
//   check('firstName', ERRORS.REQUIRED.FIRSTNAME_REQUIRED)
//     .not()
//     .isEmpty()
//     .isAlpha()
//     .withMessage(ERRORS.I),
//   check('lastName', ERRORS.REQUIRED.LASTNAME_REQUIRED)
//     .not()
//     .isEmpty()
//     .isAlpha()
//     .withMessage(ERRORS.INVALID.INVALID_LASTNAME),
//   check('email', ERRORS.INVALID.INVALID_EMAIL).not().isEmpty().isEmail(),
//   check('password', ERRORS.INVALID.PASSWORD_LENGTH)
//     .isLength({ min: 8 })
//     .custom((value, { req }) => {
//       if (value !== req.body.passwordConfirm) {
//         // trow error if passwords do not match
//         throw new Error(ERRORS.INVALID.PASSWORD_MISMATCH);
//       } else {
//         return value;
//       }
//     }),
// ];
// exports.signupPhoneRules = [
//   check('firstName', ERRORS.REQUIRED.FIRSTNAME_REQUIRED)
//     .not()
//     .isEmpty()
//     .isAlpha()
//     .withMessage(ERRORS.INVALID.INVALID_FIRSTNAME),
//   check('lastName', ERRORS.REQUIRED.LASTNAME_REQUIRED)
//     .not()
//     .isEmpty()
//     .isAlpha()
//     .withMessage(ERRORS.INVALID.INVALID_LASTNAME),
//   check('phone', 'Invalid Phone Number').not().isEmpty().isMobilePhone(),
//   check('password', ERRORS.INVALID.PASSWORD_LENGTH)
//     .isLength({ min: 8 })
//     .custom((value, { req }) => {
//       if (value !== req.body.passwordConfirm) {
//         // trow error if passwords do not match
//         throw new Error(ERRORS.INVALID.PASSWORD_MISMATCH);
//       } else {
//         return value;
//       }
//     }),
// ];

// exports.continueGoogleRules = [
//   check('firstName', `${ERRORS.REQUIRED.FIRSTNAME_REQUIRED}.${ERRORS.INVALID.INVALID_FIRSTNAME}`)
//     .not()
//     .isEmpty()
//     .isAlpha(),
//   check('lastName', `${ERRORS.REQUIRED.LASTNAME_REQUIRED}.${ERRORS.INVALID.INVALID_LASTNAME}`)
//     .not()
//     .isEmpty()
//     .isAlpha(),
//   check('googleId', ERRORS.REQUIRED.GOOGLE_ID_REQUIRED).not().isEmpty(),
//   check('email', ERRORS.INVALID.INVALID_EMAIL).not().isEmpty().isEmail(),
// ];

// exports.continueFaceBookRules = [
//   check('firstName', `${ERRORS.REQUIRED.FIRSTNAME_REQUIRED}.${ERRORS.INVALID.INVALID_FIRSTNAME}`)
//     .not()
//     .isEmpty()
//     .isAlpha(),
//   check('lastName', `${ERRORS.REQUIRED.LASTNAME_REQUIRED}.${ERRORS.INVALID.INVALID_LASTNAME}`)
//     .not()
//     .isEmpty()
//     .isAlpha(),
//   check('facebookId', ERRORS.REQUIRED.FACEBOOK_ID_REQUIRED).not().isEmpty(),
//   check('email', ERRORS.INVALID.INVALID_EMAIL).not().isEmpty().isEmail(),
// ];
