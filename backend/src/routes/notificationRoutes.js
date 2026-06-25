const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the current user
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', authenticate, notificationController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all of the current user's notifications as read
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Notification not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/admin-broadcast:
 *   post:
 *     summary: Send an administrative notification to one user or broadcast to all active users (Admin only)
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               userId: { type: string, format: uuid, description: Required when broadcastToAll is false/omitted }
 *               broadcastToAll: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: Notification sent
 *       400:
 *         description: Message required, or userId required when not broadcasting to all
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: User not found or inactive
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/admin-broadcast', authenticate, authorize('Admin'), notificationController.adminBroadcast);

module.exports = router;