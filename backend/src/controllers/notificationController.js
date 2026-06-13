const notificationService = require('../services/notificationService');
const { sendNotification } = require('../sockets/notificationSocket');

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

const adminBroadcast = async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'userId and message are required'
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