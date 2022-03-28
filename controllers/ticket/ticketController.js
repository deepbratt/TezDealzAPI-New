const Ticket = require('../../models/ticket/ticketModel');
const Validator = require('email-validator');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { filter } = require('../users/factory/factoryHandler');
const { regex } = require('../../utils/regex');

exports.createTechAssistance = catchAsync(async (req, res, next) => {
  if (req.user) {
    req.body.email = req.user.email;
    req.body.phone = req.user.phone;
    req.body.user_id = req.user._id;
  } else {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return next(new AppError(ERRORS.REQUIRED.EMAIL_AND_PHONE_REQUIRED, STATUS_CODE.BAD_REQUEST));
    }
  }
  if (!req.body.description) {
    return next(new AppError(ERRORS.REQUIRED.DESCRIPTION_REQUIRED, STATUS_CODE.BAD_REQUEST));
  }
  req.body.type = 'Technical Assistance';
  if (regex.pakPhone.test(req.body.phone) && Validator.validate(req.body.email)) {
    const result = await Ticket.create(req.body);

    if (!result) return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));

    res.status(STATUS_CODE.CREATED).json({
      status: STATUS.SUCCESS,
      message: SUCCESS_MSG.SUCCESS_MESSAGES.TICKET_TECHNICAL_ISSUE_CREATED,
      data: {
        result,
      },
    });
  } else {
    return next(new AppError(ERRORS.INVALID.PROVIDE_VALID_EMAIL_PHONE, STATUS_CODE.BAD_REQUEST));
  }
});

exports.createAdvAssistance = catchAsync(async (req, res, next) => {
  req.body.email = req.user.email;
  req.body.phone = req.user.phone;
  req.body.user_id = req.user._id;
  req.body.type = 'Advertisement Assistance';
  const result = await Ticket.create(req.body);
  if (!result) return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.TICKET_ADVERTISEMENT_ASSISTANCE_CREATED,
    data: {
      result,
    },
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  const [result, totalCount] = await filter(Ticket.find(), req.query);

  if (result.length <= 0) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ALL_TICKETS,
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const result = await Ticket.findById(req.params.id);
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.ONE_TICKET,
    data: {
      result,
    },
  });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const result = await Ticket.findByIdAndDelete(req.params.id);
  if (!result) return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE_TICKET,
    data: null,
  });
});

exports.updateOne = catchAsync(async (req, res, next) => {
  const result = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE_TICKET,
    data: {
      result,
    },
  });
});

exports.closeTicket = catchAsync(async (req, res, next) => {
  const data = await Ticket.findOne({ _id: req.params.id, status: 'opened' });
  if (!data) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  const result = await Ticket.findByIdAndUpdate(
    req.params.id,
    {
      status: 'closed',
      closedAt: new Date(),
    },
    { new: true },
  );
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.TICKET_CLOSED,
    data: {
      result,
    },
  });
});
