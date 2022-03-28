const jwt = require('jsonwebtoken');
// const { OAuth2Client } = require('google-auth-library');
const Validator = require('email-validator');
const User = require('../../../models/user/userModel');
const { AppError } = require('@utils/tdb_globalutils');
const catchAsync = require('@utils/tdb_globalutils/errorHandling/catchAsync');
const { ERRORS, STATUS_CODE, SUCCESS_MSG, STATUS, ROLES } = require('@constants/tdb-constants');
const jwtManagement = require('../../../utils/jwtManagement');
const { pakPhone, regex } = require('../../../utils/regex');
const Email = require('../../../utils/email-mailgun');

// const sendSMS = require('../../utils/sendSMS');
// const {
//   sendVerificationCodetoEmail,
//   sendVerificationCodetoPhone,
// } = require('./accountVerification');

// Sign Up
exports.signup = catchAsync(async (req, res, next) => {
  if (!req.body.data) {
    return next(
      new AppError(
        `${ERRORS.REQUIRED.EMAIL_REQUIRED} / ${ERRORS.REQUIRED.PHONE_REQUIRED}`,
        STATUS_CODE.BAD_REQUEST,
      ),
    );
  }
  let user;
  if (Validator.validate(req.body.data)) {
    user = await User.create({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email: req.body.data,
      username: req.body.username,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      signedUpWithEmail: true,
    });
    await new Email(user.email, { ...user._doc }).welcomeDev();
  } else if (regex.pakPhone.test(req.body.data)) {
    user = await User.create({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      phone: req.body.data,
      username: req.body.username,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      signedUpWithPhone: true,
    });
  } else {
    return next(
      new AppError(
        `${ERRORS.INVALID.INVALID_EMAIL} / ${ERRORS.INVALID.INVALID_PHONE}`,
        STATUS_CODE.BAD_REQUEST,
      ),
    );
  }

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ACCOUNT_CREATED,
  });
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { data, password } = req.body;
  if (!data || !password) {
    // checking email or password empty?
    return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.BAD_REQUEST));
  }
  // Finding user by username, phone or email
  const user = await User.findOne({
    $or: [
      {
        email: data,
      },
      {
        phone: data,
      },
      {
        username: data,
      },
    ],
  }).select('+password');

  //user existance and password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.BAD_REQUEST));
  }
  if (user.role !== ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.BAD_REQUEST));
  }
  // Check if user is banned , if banned then Throw Error
  if (user.banned) {
    return next(new AppError(ERRORS.UNAUTHORIZED.BAN_BY_ADMIN, STATUS_CODE.UNAUTHORIZED));
  }
  // Check if user is active or not
  if (!user.active) {
    // If no user and not active:true then return Error
    return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.NOT_FOUND));
  }
  jwtManagement.createSendJwtToken(user, STATUS_CODE.OK, req, res);
});

exports.adminPanellogin = catchAsync(async (req, res, next) => {
  const { data, password } = req.body;
  if (!data || !password) {
    // checking email or password empty?
    return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.BAD_REQUEST));
  }
  // Finding user by username, phone or email
  const user = await User.findOne({
    $or: [
      {
        email: data,
      },
      {
        phone: data,
      },
      {
        username: data,
      },
    ],
  }).select('+password');
  //user existance and password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.BAD_REQUEST));
  }
  if (user.role === ROLES.USERROLES.INDIVIDUAL) {
    return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.BAD_REQUEST));
  }
  // Check if user is banned , if banned then Throw Error
  if (user.banned || !user.active) {
    return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.BAD_REQUEST));
  }
  jwtManagement.createSendJwtToken(user, STATUS_CODE.OK, req, res);
});

// Check logged in User
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //getting token and check is it there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.session.jwt) {
    token = req.session.jwt;
  }
  if (!token) {
    return next(new AppError(ERRORS.UNAUTHORIZED.NOT_LOGGED_IN, STATUS_CODE.UNAUTHORIZED));
  }
  //verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //check if user sitll exists
  const currentUser = await User.findById(decoded.userdata.id);
  if (!currentUser) {
    return next(new AppError(`User ${ERRORS.INVALID.NOT_FOUND}`, STATUS_CODE.NOT_FOUND));
  }
  //check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(ERRORS.UNAUTHORIZED.INVALID_JWT, STATUS_CODE.UNAUTHORIZED));
  }
  //send loggedIn User
  res.status(STATUS_CODE.OK).json({
    user: currentUser,
  });
});

//* ----------------------------------Previous Code is Below -----------------------------

// const client = new OAuth2Client(process.env.CLIENT_ID);
// New Continue With Google
// exports.continueWithGoogle = catchAsync(async (req, res, next) => {
// 	const { token } = req.body;
// 	const ticket = await client.verifyIdToken({
// 		idToken: token,
// 		audience: process.env.CLIENT_ID,
// 	});
// 	const { name, email, picture } = ticket.getPayload();
// 	const user = await db.user.upsert({
// 		where: { email: email },
// 		update: { name, picture },
// 		create: { name, email, picture },
// 	});
// 	let user;
// 	user = await User.findOne({ googleId: req.body.googleId });
// 	if (!user) {
// 		req.body.isVerified = true;
// 		user = await User.create(req.body);
// 	}
// 	jwtManagement.createSendJwtToken(user, STATUS_CODE.OK, req, res);
// });
// Continue With Google
// exports.continueGoogle = catchAsync(async (req, res, next) => {
//   let user;
//   user = await User.findOne({ googleId: req.body.googleId });
//   if (!user) {
//     req.body.isVerified = true;
//     req.body.isEmailVerified = true;
//     user = await User.create(req.body);
//   }
//   jwtManagement.createSendJwtToken(user, STATUS_CODE.OK, req, res);
// });

// // Continue With Facebook
// exports.continueFacebook = catchAsync(async (req, res, next) => {
//   let user;
//   user = await User.findOne({ facebookId: req.body.facebookId });
//   if (!user) {
//     req.body.isVerified = true;
//     user = await User.create(req.body);
//   }
//   jwtManagement.createSendJwtToken(user, STATUS_CODE.OK, req, res);
// });

// Sign Up with Email
// exports.signupEmail = catchAsync(async (req, res, next) => {
//   const newUser = {
//     firstName: req.body.firstName.trim(),
//     lastName: req.body.lastName.trim(),
//     email: req.body.email.trim(),
//     password: req.body.password,
//     passwordConfirm: req.body.passwordConfirm,
//   };

//   let user = await User.create(newUser);

//   const token = await user.emailVerificationToken();
//   await new Email(user, token).sendEmailVerificationToken();
//   user.loggedInWithEmail = true;
//   await user.save();
//   res.status(STATUS_CODE.CREATED).json({
//     status: STATUS.SUCCESS,
//     message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
//   });
// });

// // Check logged in User
// exports.isLoggedIn = catchAsync(async (req, res, next) => {
//   //getting token and check is it there
//   let token;
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.session.jwt) {
//     token = req.session.jwt;
//   }
//   if (!token) {
//     return next(new AppError(ERRORS.UNAUTHORIZED.NOT_LOGGED_IN, STATUS_CODE.UNAUTHORIZED));
//   }
//   //verification token
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   //check if user sitll exists
//   const currentUser = await User.findById(decoded.userdata.id);
//   if (!currentUser) {
//     return next(new AppError(`User ${ERRORS.INVALID.NOT_FOUND}`, STATUS_CODE.NOT_FOUND));
//   }
//   //check if user changed password after the token was issued
//   if (currentUser.changedPasswordAfter(decoded.iat)) {
//     return next(new AppError(ERRORS.UNAUTHORIZED.INVALID_JWT, STATUS_CODE.UNAUTHORIZED));
//   }
//   //send loggedIn User
//   res.status(STATUS_CODE.OK).json({
//     user: currentUser,
//   });
// });

// Sign Up With Phone
// exports.signupPhone = catchAsync(async (req, res, next) => {
//   const newUser = {
//     firstName: req.body.firstName.trim(),
//     lastName: req.body.lastName.trim(),
//     phone: req.body.phone,
//     password: req.body.password,
//     passwordConfirm: req.body.passwordConfirm,
//   };

//   const user = await User.create(newUser);

//   user.loggedInWithPhone = true;

//   const verificationToken = await user.phoneVerificationToken();//   await user.save({ validateBeforeSave: false });
//   await sendSMS({
//     body: `${SUCCESS_MSG.SUCCESS_MESSAGES.TEZDEALZ_VEFRIFICATION_CODE} ${verificationToken}`,
//     phone: newUser.phone, // Text this number
//     from: process.env.TWILIO_PHONE_NUMBER, // From a valid Twilio number
//   });

//   res.status(STATUS_CODE.CREATED).json({
//     status: STATUS.SUCCESS,
//     message: `${SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL} ${SUCCESS_MSG.SUCCESS_MESSAGES.ACCOUNT_VERIFICATION_TOKEN}`,
//   });
// });

// Login with Email
// exports.loginEmail = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     // checking email or password empty?
//     return next(new AppError(ERRORS.INVALID.NO_CREDENTIALS_EMAIL, STATUS_CODE.BAD_REQUEST));
//   }
//   const user = await User.findOne({ email: email }).select('+password');
//   if (!user) {
//     return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
//   }

//   // Check if user is logged in with email or not. if yes then he can log in otherwise unauthorize
//   if (!user.loggedInWithEmail) {
//     return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.UNAUTHORIZED));
//   }

//   if (user.googleId || user.facebookId) {
//     return next(
//       new AppError(ERRORS.INVALID.WRONG_CREDENTIAL_ERROR_EMAIL, STATUS_CODE.UNAUTHORIZED),
//     );
//   }
//   //user existance and password is correct
//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(
//       new AppError(ERRORS.INVALID.WRONG_CREDENTIAL_ERROR_EMAIL, STATUS_CODE.UNAUTHORIZED),
//     );
//   }
//   // check acccount verification
//   if (!user.isVerified || !user.isEmailVerified) {
//     return await sendVerificationCodetoEmail(req, res, next);
//   }

//   jwtManagement.createSendJwtToken(user, STATUS_CODE.OK, req, res);
// });

// Login with Phone Number
// exports.loginPhone = catchAsync(async (req, res, next) => {
//   const { phone, password } = req.body;

//   if (!phone || !password) {
//     // checking email or password empty?
//     return next(new AppError(ERRORS.INVALID.NO_CREDENTIALS_PHONE, STATUS_CODE.BAD_REQUEST));
//   }

//   const user = await User.findOne({ phone: phone }).select('+password');
//   if (!user) {
//     return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
//   }

//   // Check if user is logged in with phone or not. if yes then he can log in otherwise unauthorize
//   if (!user.loggedInWithPhone) {
//     return next(new AppError(ERRORS.INVALID.INVALID_CREDENTIALS, STATUS_CODE.UNAUTHORIZED));
//   }

//   if (user.googleId || user.facebookId) {
//     return next(
//       new AppError(ERRORS.INVALID.WRONG_CREDENTIAL_ERROR_PHONE, STATUS_CODE.UNAUTHORIZED),
//     );
//   }
//   //user existance and password is correct
//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(
//       new AppError(ERRORS.INVALID.WRONG_CREDENTIAL_ERROR_PHONE, STATUS_CODE.UNAUTHORIZED),
//     );
//   }

//   // check acccount verification
//   if (!user.isVerified || !user.isPhoneVerified) {
//     return await sendVerificationCodetoPhone(req, res, next);
//   }

//   jwtManagement.createSendJwtToken(user, STATUS_CODE.OK, req, res);
// });

// Add Current user's phone // user logged in with email
// exports.addUserPhone = catchAsync(async (req, res, next) => {
//   //Get user form User's Collection
//   const user = await User.findByIdAndUpdate(req.user.id, req.body, {
//     runValidators: true,
//   });

//   // check if user logged in with email
//   if (!user.loggedInWithEmail) {
//     return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
//   }

//   /**
//    * If User logged in with email and tries to update his phone he can update them.
//    * If User alrady has its phone verified then it will generate error
//    */
//   if (user.loggedInWithEmail === true && req.body.phone) {
//     // if user has already verified his phone then he cannot change it again.
//     if (user.isPhoneVerified === true) {
//       return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
//     }
//     return await sendVerificationCodetoPhone(req, res, next);
//   }

//   /**
//    * If User logged in with email and tries to update his email then it will generate an error
//    */
//   if (user.loggedInWithEmail === true && req.body.email) {
//     return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
//   }
// });

// Update My Email // User logged in with Phone
// exports.addUserEmail = catchAsync(async (req, res, next) => {
//   //Get user form User's Collection
//   const user = await User.findByIdAndUpdate(req.user.id, req.body, {
//     runValidators: true,
//   });

//   // chek if user logged in with phone
//   if (!user.loggedInWithPhone) {
//     return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
//   }

//   if (user.loggedInWithPhone === true && req.body.email) {
//     // if user has already verified his email then he cannot change it again.
//     if (user.isEmailVerified === true) {
//       return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
//     }

//     return await sendVerificationCodetoEmail(req, res, next);
//   }

//   /**
//    * If User logged in with phone and tries to update his phone then it will generate an error
//    */
//   if (user.loggedInWithPhone === true && req.body.phone) {
//     return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
//   }
// });
