const express = require('express');
const User = require('../../models/user/userModel');
const appointmentsController = require('../../controllers/appointments/inspectionAppointment');
const { checkIsLoggedIn, authenticate, restrictTo } = require('@auth/tdb-auth');
const { permessionCheck } = require('../../middleware/index');

const router = express.Router();

router.post(
  '/car_inspection',
  checkIsLoggedIn(User),
  appointmentsController.createInspectionAppointment,
);

router.use(authenticate(User));

router.patch(
  '/cancel-inspection/:id',
  permessionCheck,
  appointmentsController.cancelInspectionAppointment,
);
router.patch(
  '/reopen-inspection/:id',
  permessionCheck,
  appointmentsController.reOpenInspectionAppointment,
);

router.get('/my_inspection_appointments', appointmentsController.getMyInspectionAppointments);

router.get(
  '/car_inspection',
  restrictTo('Admin', 'Moderator'),
  appointmentsController.getAllInspectionAppointments,
);

router
  .route('/car_inspection/:id')
  .get(restrictTo('Admin', 'Moderator'), appointmentsController.getOneInspectionAppointment)
  .patch(restrictTo('Admin', 'Moderator'), appointmentsController.updateInspectionAppointment)
  .delete(restrictTo('Admin', 'Moderator'), appointmentsController.deleteInspectionAppointment);

module.exports = router;
