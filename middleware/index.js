const Appointments = require('../models/appointments/inspectionAppointmentModel');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { ERRORS, STATUS_CODE } = require('@constants/tdb-constants');

exports.permessionCheck = catchAsync(async (req, res, next) => {
  const currentUserId = req.user._id;
  const result = await Appointments.findById(req.params.id);
  if (!result) return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  if (!currentUserId.equals(result.user_id) && req.user.role === 'User') {
    return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
  }
  next();
});
