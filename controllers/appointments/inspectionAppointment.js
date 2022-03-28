const Appointments = require('../../models/appointments/inspectionAppointmentModel');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { APIFeatures } = require('@utils/tdb_globalutils');

exports.createInspectionAppointment = catchAsync(async (req, res, next) => {
  if (req.user) {
    if (!req.user.phone) {
      return next(
        new AppError('Please enter phone number in your profile', STATUS_CODE.UNAUTHORIZED),
      );
    }

    req.body.firstName = req.user.firstName;
    req.body.lastName = req.user.lastName;
    req.body.phone = req.user.phone;
    req.body.user_id = req.user._id;

    if (req.user.role === 'User' && (req.body.status || req.body.mechanicAssigned)) {
      return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
    }
  } else {
    const { firstName, lastName, phone, carLocation } = req.body;
    if (!firstName || !lastName || !phone || !carLocation) {
      return next(
        new AppError(
          'Please Provide a first name, last name , phone or car location',
          STATUS_CODE.BAD_REQUEST,
        ),
      );
    }
    if (req.body.status || req.body.mechanicAssigned) {
      return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
    }
  }

  const result = await Appointments.create(req.body);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    data: {
      result,
    },
  });
});

exports.getAllInspectionAppointments = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Appointments.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const result = await features.query;

  if (!result || result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    totalCount: result.length,
    data: {
      result,
    },
  });
});

exports.getOneInspectionAppointment = catchAsync(async (req, res, next) => {
  const result = await Appointments.findById(req.params.id);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    data: {
      result,
    },
  });
});

exports.updateInspectionAppointment = catchAsync(async (req, res, next) => {
  const result = await Appointments.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE,
    data: {
      result,
    },
  });
});

exports.deleteInspectionAppointment = catchAsync(async (req, res, next) => {
  const result = await Appointments.findByIdAndDelete(req.params.id);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE,
  });
});

exports.getMyInspectionAppointments = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Appointments.find({ user_id: req.user._id }), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .pagination();

  const result = await features.query;

  if (result.length === 0)
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    total: result.length,
    data: {
      result,
    },
  });
});

exports.cancelInspectionAppointment = catchAsync(async (req, res, next) => {
  const result = await Appointments.findOne({ _id: req.params.id, cancelled: false });
  if (!result) {
    return next(
      new AppError('Appointment is already cancelled or does not exists.', STATUS_CODE.BAD_REQUEST),
    );
  }
  await Appointments.updateOne({ _id: req.params.id }, { cancelled: true });
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: 'Your Appointment is cancelled successfully',
  });
});

exports.reOpenInspectionAppointment = catchAsync(async (req, res, next) => {
  const result = await Appointments.findOne({ _id: req.params.id, cancelled: true });
  if (!result) {
    return next(
      new AppError('Appointment is already re-opened or does not exists.', STATUS_CODE.BAD_REQUEST),
    );
  }
  await Appointments.updateOne({ _id: req.params.id }, { cancelled: false });
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: 'Your Appointment is re-opened successfully',
  });
});
