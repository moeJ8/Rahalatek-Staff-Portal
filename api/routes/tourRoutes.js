const express = require('express');
const tourController = require('../controllers/tourController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', tourController.getAllTours);
router.get('/country/:country', tourController.getToursByCountry);
router.get('/country/:country/cities', tourController.getTourCitiesByCountry);
router.get('/countries', tourController.getTourCountries);
router.get('/city/:city', tourController.getToursByCity);
router.get('/:id', tourController.getTourById);
router.post('/', tourController.addTour);
router.put('/:id', tourController.updateTour);
router.delete('/:id', verifyToken, tourController.deleteTour);

module.exports = router;

