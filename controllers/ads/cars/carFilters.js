const Car = require('../../../models/cars/carsModel');

const { citiesByProvince } = require('../../users/factory/factoryHandler');

exports.getCitiesByProvince = citiesByProvince(Car);

