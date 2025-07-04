const express = require('express');
const officeController = require('../controllers/officeController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/offices - Get all offices
router.get('/', officeController.getAllOffices);

// GET /api/offices/:id - Get office by ID
router.get('/:id', officeController.getOfficeById);

// POST /api/offices - Create new office (Admin or Accountant only)
router.post('/', officeController.createOffice);

// PUT /api/offices/:id - Update office (Admin or Accountant only)
router.put('/:id', officeController.updateOffice);

// DELETE /api/offices/:id - Delete office (Admin or Accountant only)
router.delete('/:id', officeController.deleteOffice);

module.exports = router; 