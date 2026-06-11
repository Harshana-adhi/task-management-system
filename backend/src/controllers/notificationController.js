const notificationService = require('../Services/notificationService');

// GET /api/notifications — get all notifications for logged-in user
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const notifications = await notificationService.getAllNotifications(userId);
        return res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('getMyNotifications error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// PATCH /api/notifications/:notificationId/read — mark one as read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.user_id;

        const notification = await notificationService.markAsRead(notificationId, userId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Notification not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read.',
            notification
        });
    } catch (error) {
        console.error('markAsRead error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// PATCH /api/notifications/read-all — mark all as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        await notificationService.markAllAsRead(userId);
        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read.'
        });
    } catch (error) {
        console.error('markAllAsRead error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// POST /api/notifications/admin-broadcast — Admin sends update to a user
const adminBroadcast = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const userRole = req.user.role_name;

        if (userRole !== 'Admin') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Only Admins can broadcast administrative updates.'
            });
        }

        if (!userId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'userId and message are required.'
            });
        }

        const { sendNotification } = require('../socket/notificationSocket');
        await sendNotification({
            userId,
            title: 'Administrative Update',
            message
        });

        return res.status(200).json({
            success: true,
            message: 'Administrative notification sent.'
        });
    } catch (error) {
        console.error('adminBroadcast error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    adminBroadcast
};
