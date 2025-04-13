const express = require('express');
const tourController = require('../controllers/tourController');
const router = express.Router();

// Get all tours
router.get('/', tourController.getAllTours);

// Get tours by city
router.get('/city/:city', tourController.getToursByCity);

// Get tour by ID
router.get('/:id', tourController.getTourById);

// Add new tour
router.post('/', tourController.addTour);

// Update tour
router.put('/:id', tourController.updateTour);

// Delete tour
router.delete('/:id', tourController.deleteTour);

module.exports = router;

