const notificationService = require('../services/notificationService');
const { sendNotification } = require('../sockets/notificationSocket');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const notifications = await notificationService.getAllNotifications(userId);
        return res.status(200).json(notifications);

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch notifications'
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.user_id;

        const notification = await notificationService.markAsRead(notificationId, userId);

        return res.status(200).json({
            message: 'Notification marked as read',
            notification
        });

    } catch (error) {
        const isNotFound = error.message === 'Notification not found';
        return res.status(isNotFound ? 404 : 500).json({
            error: isNotFound ? 'Not Found' : 'Internal Server Error',
            message: error.message
        });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        await notificationService.markAllAsRead(userId);
        return res.status(200).json({
            message: 'All notifications marked as read'
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to mark notifications as read'
        });
    }
};

// Send to one specific user OR broadcast to all users
const adminBroadcast = async (req, res) => {
    try {
        const { userId, message, broadcastToAll } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Message is required'
            });
        }

        // Option 1 — Broadcast to ALL active users
        if (broadcastToAll === true) {
            const allUserIds = await notificationService.getAllActiveUserIds();

            for (const targetUserId of allUserIds) {
                await sendNotification({
                    userId: targetUserId,
                    title: 'Administrative Update',
                    message
                });
            }

            return res.status(200).json({
                message: `Administrative notification sent to ${allUserIds.length} user(s)`
            });
        }

        // Option 2 — Send to one specific user
        if (!userId) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'userId is required when broadcastToAll is false'
            });
        }

        // Validate UUID format before querying DB
        if (!UUID_REGEX.test(userId)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'userId must be a valid UUID'
            });
        }

        // Check user exists
        const userExists = await notificationService.checkUserExists(userId);
        if (!userExists) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found or inactive'
            });
        }

        await sendNotification({
            userId,
            title: 'Administrative Update',
            message
        });

        return res.status(200).json({
            message: 'Administrative notification sent'
        });

    } catch (error) {
    console.error('adminBroadcast error:', error);
    return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to send notification'
        });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    adminBroadcast
};