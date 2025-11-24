const express = require('express');
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// CRUD operations
router.post('/', bookingController.createBooking);
router.get('/metadata', bookingController.getBookingsMetadata);
router.get('/', bookingController.getAllBookings);
router.get('/trash', bookingController.getTrashedBookings);
router.get('/:id/download-pdf', bookingController.downloadBookingPDF);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);
router.post('/:id/restore', bookingController.restoreBooking);
router.delete('/:id/permanent', bookingController.permanentlyDeleteBooking);

module.exports = router;

