const express = require('express');
const User = require('../../models/user/userModel');
const ticketController = require('../../controllers/ticket/ticketController');
const { authenticate, checkIsLoggedIn, restrictTo } = require('@auth/tdb-auth');
const { ROLES } = require('@constants/tdb-constants');
//const cache = require('../utils/cache');
//const cacheExp = 30;
const router = express.Router();

router.post(
  '/techAssistance',
  checkIsLoggedIn(User),
  //cache(cacheExp),
  ticketController.createTechAssistance,
);

router.use(authenticate(User));

router.post(
  '/advAssistance',
  restrictTo(ROLES.USERROLES.INDIVIDUAL),
  //cache(cacheExp),
  ticketController.createAdvAssistance,
);

router.use(restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR));

router.get(
  '/',
  //cache(cacheExp),
  ticketController.getAll,
);
router.patch('/close/:id', ticketController.closeTicket);
router
  .route('/:id')
  .get(ticketController.getOne)
  .patch(ticketController.updateOne)
  .delete(ticketController.deleteOne);

module.exports = router;
