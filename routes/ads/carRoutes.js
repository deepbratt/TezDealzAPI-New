const express = require('express');
const User = require('../../models/user/userModel');
const carController = require('../../controllers/ads/cars/carController');
const carModelController = require('../../controllers/ads/cars/modelController');
const carVersionController = require('../../controllers/ads/cars/versionController');
const adminController = require('../../controllers/ads/admin/adminController');
const bodyTypeController = require('../../controllers/ads/cars/bodyTypesController');
const carMakeController = require('../../controllers/ads/cars/carMakeContoller');
const featuresController = require('../../controllers/ads/cars/featuresController');
const colorController = require('../../controllers/ads/cars/colorController');
const showNumberController = require('../../controllers/ads/cars/showNumberController');
const bulkUploadsController = require('../../controllers/ads/cars/bulkUploadAds');
const carImagesController = require('../../controllers/ads/cars/carsImagesController');
const countryStateProvince = require('../../controllers/ads/country-city-state-province/countryCityState');
const carFilters = require('../../controllers/ads/cars/carFilters');
const { authenticate, checkIsLoggedIn, restrictTo } = require('@auth/tdb-auth');
const {
  permessionCheck,
  favPermessionCheck,
  phoneCheckOnCreate,
  phoneCheckOnupdate,
} = require('../../middleware/cars/index');
const { multipleUploads } = require('@utils/tdb_globalutils');
const { ROLES } = require('@constants/tdb-constants');
const { fileUpload, upload } = require('../../utils/fileUpload');
//const cache = require('../utils/cache');
//const cacheExp = 30;
const router = express.Router();
// const { isCached } = require('../utils/redisCache');

router.route('/cities').get(countryStateProvince.getAllCities);

router.route('/states').get(countryStateProvince.getAllStates);

router.route('/cities/country-code/:countrycode').get(countryStateProvince.getCitiesOfCountry);

router
  .route('/cities/state-code/:stateCode/:countryCode')
  .get(countryStateProvince.getCitiesOfState);

router.route('/states/state-code/:stateCode').get(countryStateProvince.getStateByCode);

router
  .route('/states/country-code/:stateCode/:countryCode')
  .get(countryStateProvince.getStateByCodeAndCountry);

router.route('/states/country-code/:countryCode').get(countryStateProvince.getStatesOfCountry);

// To post ads images directly to the S3 Bucket
router
  .route('/car-images')
  .post(
    authenticate(User),
    multipleUploads('image', 'application').fields([
      { name: 'image', maxCount: 20 },
      { name: 'selectedImage', maxCount: 1 },
    ]),
    carImagesController.imageUploader,
  )
  .get(authenticate(User), carImagesController.getAllCarImages);

router.route('/car-images/:id').get(authenticate(User), carImagesController.getOneCarImage);

// Publish Ad
router.route('/publish-ad/:id').patch(authenticate(User), permessionCheck, carController.publishAd);

router
  .route('/bulk-uploads-stats/:id')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    bulkUploadsController.getAllBulkUploadsOfUser,
  );

router
  .route('/bulk-ads/:id')
  .post(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    multipleUploads('text', 'application').single('csvFile'),
    bulkUploadsController.createBulkUploadAds,
  );
router
  .route('/bulk-ads')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    bulkUploadsController.getAllBulkAds,
  );

router
  .route('/bulk-ads/:id')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    bulkUploadsController.getOneBulkAd,
  )
  .patch(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    bulkUploadsController.UpdateBulkAd,
  )
  .delete(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    bulkUploadsController.deleteBulkAd,
  );

//Show Number
router.post('/show-number/:id', authenticate(User), showNumberController.createShowNumberDetails);
router
  .route('/show-number')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    showNumberController.getAllShowNumberData,
  );
router
  .route('/show-number/:id')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    showNumberController.getOneShowNumberDetail,
  )
  .patch(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    showNumberController.updateShowNumberDetails,
  )
  .delete(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    showNumberController.deleteShowNumberDetails,
  );

// router
//   .route('/show-number/add-detail-of-ad/:id')
//   .patch(authenticate(User), showNumberController.addToShowNumberOfAd);

router
  .route('/show-number/logs/:id')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    showNumberController.getAllLogsOfOneAd,
  );

//location based search
router.route('/cars-within/:distance/center/:latlng/unit/:unit').get(carController.getCarsWithin);

//colors

router
  .route('/colors')
  .post(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    colorController.createOne,
  )
  .get(colorController.getAll);
router
  .route('/colors/:id')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    colorController.getOne,
  )
  .patch(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    colorController.updateOne,
  )
  .delete(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    colorController.deleteOne,
  );

// OWNERS LIST
router
  .route('/owners-list')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    adminController.getAllOwners,
  );

/**
 * Features Routes
 */
router
  .route('/features')
  .get(featuresController.getAllFeatures)
  .post(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    upload('image').single('image'),
    featuresController.createFeature,
  );
router
  .route('/features/:id')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    featuresController.getOneFeature,
  )
  .patch(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    upload('image').single('image'),
    featuresController.UpdateOneFeature,
  )
  .delete(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    featuresController.deleteFeature,
  );

/**
 * Total cars sold and sold in Current month.
 * Total cars Sold by our platform and  total cars sold by platform in Current month.
 */
router
  .route('/sold-cars-stats')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    adminController.totalSoldCars,
  );
router
  .route('/sold-cars-by-platform-stats')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    adminController.carsSoldByPlatform,
  );

//       CAR BODYTYPES //
router
  .route('/body-types')
  .get(bodyTypeController.getAllBodyTypes)
  .post(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    upload('image').single('image'),
    bodyTypeController.createBodyType,
  );
router
  .route('/body-types/:id')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    bodyTypeController.getOneBodyType,
  )
  .patch(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    upload('image').single('image'),
    bodyTypeController.updateBodyType,
  )
  .delete(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    bodyTypeController.deleteBodyType,
  );

/////////////////////////////////// Admin Routes ////////////////////////////

router
  .route('/car-owners-stats')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    adminController.carOwners,
  );
router
  .route('/cars-stats')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    adminController.cars,
  );
router
  .route('/top-viewed')
  .get(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    adminController.views,
  );
router
  .route('/ban/:id')
  .patch(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    carController.markbanned,
  );
router
  .route('/unban/:id')
  .patch(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    carController.markunbanned,
  );
////////////////////////////// CAR MAKE MODEL ////////////////////////////////////////

// Car Makes
router
  .route('/makes')
  .get(
    //cache(cacheExp),
    carMakeController.getAllMakes,
  )
  .post(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    carMakeController.createMake,
  );
router
  .route('/makes/:id')
  .get(
    //cache(cacheExp),
    carMakeController.getOneMake,
  )
  .patch(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    carMakeController.updateMake,
  )
  .delete(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    carMakeController.deleteMake,
  );

// models with specific make.
router
  .route('/models')
  .get(carModelController.getAllModels)
  .post(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    carModelController.createModel,
  );
router
  .route('/models/:id')
  .get(carModelController.getOneModel)
  .patch(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    carModelController.updateModel,
  )
  .delete(
    authenticate(User),
    restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
    carModelController.deleteModel,
  );

// Versions
router.get('/versions', carVersionController.getVersions);
router.post(
  '/add-versions',
  authenticate(User),
  restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
  carVersionController.addVersion,
);
router.patch(
  '/update-versions/:id',
  authenticate(User),
  restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
  carVersionController.updateVersion,
);
router.delete(
  '/remove-versions/:id',
  authenticate(User),
  restrictTo(ROLES.USERROLES.ADMIN, ROLES.USERROLES.MODERATOR),
  carVersionController.removeVersion,
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Create an Advertisement
router.route('/').post(authenticate(User), phoneCheckOnCreate, carController.createOne);
router.route('/').get(
  checkIsLoggedIn(User), //cache(cacheExp),
  carController.getAll,
);
router.route('/myCars').get(
  authenticate(User), //cache(cacheExp),
  carController.getMine,
);

//////////////////////////////FAVOURITES/////////////////////////////////////////
router.route('/favourites').get(
  authenticate(User), //cache(cacheExp),
  carController.favorites,
);

router
  .route('/add-to-fav/:id')
  .patch(authenticate(User), favPermessionCheck, carController.addtoFav);
router.route('/remove-from-fav/:id').patch(authenticate(User), carController.removeFromFav);

///////////////////////MARK ACTIVE/SOLD////////////////////////////////////
router.route('/mark-sold/:id').patch(
  authenticate(User), //cache(cacheExp),
  permessionCheck,
  carController.markSold,
);
router.route('/mark-unsold/:id').patch(
  authenticate(User),
  //cache(cacheExp),
  permessionCheck,
  carController.unmarkSold,
);
router.route('/mark-active/:id').patch(
  authenticate(User),
  //cache(cacheExp),
  permessionCheck,
  carController.markActive,
);
router.route('/mark-inactive/:id').patch(
  authenticate(User), //cache(cacheExp),
  permessionCheck,
  carController.unmarkActive,
);
/////////////////////////////////////////////////////////////////////////////////////////////
router
  .route('/:id')
  .get(
    checkIsLoggedIn(User), //cache(cacheExp),
    carController.getOne,
  )
  .patch(authenticate(User), permessionCheck, phoneCheckOnupdate, carController.updateOne)
  .delete(authenticate(User), permessionCheck, carController.deleteOne);
/////////////////////////////////////////////////////////////////////////////////////////////
//city filter
////////////////////////////////////////////////////////////////////////////////////////////
router.route('/filter/cities-with-cars').get(
  //cache(cacheExp),
  carFilters.getCitiesByProvince,
);

module.exports = router;

// To remove Model in models array by finding with Id.
// router.patch('/remove-model/:id', carMakeModelController.removeFromModel);

// router
// 	.route('/make-model')
// 	.get(carMakeModelController.getAllMakesModels)
// 	.post(carMakeModelController.createMakeModel);
// router
// 	.route('/make-model/:id')
// 	.get(carMakeModelController.getMakeModel)
// 	.patch(carMakeModelController.updateMakeModel)
// 	.delete(carMakeModelController.deleteMakeModel);

////////////////////////////////////////////////////////////////////////////////////////////

// router
//   .route('/cars')
//   .post(authenticate(User), upload('image').array('image', 20), carController.createOne);
// router.route('/cars').get(checkIsLoggedIn(User), carController.getAll);
// router.route('/cars/myCars').get(authenticate(User), carController.getMine);

//router.route('/stats').get(authenticate(User), carController.carStats);
//router.route('/daily-stats/:min/:max').get(authenticate(User), carController.carDailyStats);
//router.route('/cars/daily-stats/:min/:max').get(authenticate(User), carController.carDailyStats);
