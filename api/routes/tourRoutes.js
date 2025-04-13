const express = require('express');
const tourController = require('../controllers/tourController');
const router = express.Router();

router.get('/', tourController.getAllTours);
router.get('/city/:city', tourController.getToursByCity);
router.get('/:id', tourController.getTourById);
router.post('/', tourController.addTour);
router.put('/:id', tourController.updateTour);
router.delete('/:id', tourController.deleteTour);

module.exports = router;

