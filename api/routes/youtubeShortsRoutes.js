const express = require('express');
const router = express.Router();
const youtubeShortsController = require('../controllers/youtubeShortsController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/active', youtubeShortsController.getActiveShorts);
router.post('/:id/view', youtubeShortsController.incrementViews);

// Protected routes - Admin and Content Manager only
router.get('/', verifyToken, youtubeShortsController.getAllShorts);
router.get('/:id', verifyToken, youtubeShortsController.getShortById);
router.post('/', verifyToken, youtubeShortsController.createShort);
router.put('/:id', verifyToken, youtubeShortsController.updateShort);
router.delete('/:id', verifyToken, youtubeShortsController.deleteShort);
router.post('/reorder', verifyToken, youtubeShortsController.reorderShorts);

module.exports = router;

