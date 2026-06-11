const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', notificationController.getMyNotifications);                          // Get all my notifications
router.patch('/read-all', notificationController.markAllAsRead);                     // Mark all as read
router.patch('/:notificationId/read', notificationController.markAsRead);            // Mark one as read
router.post('/admin-broadcast', notificationController.adminBroadcast);              // Admin sends update

module.exports = router;
