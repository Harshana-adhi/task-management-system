const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Get all my notifications
router.get('/', authenticate, notificationController.getMyNotifications);

// Mark all as read
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

// Mark one as read
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);

// Admin broadcast
router.post('/admin-broadcast', authenticate, authorize('Admin'), notificationController.adminBroadcast);

module.exports = router;