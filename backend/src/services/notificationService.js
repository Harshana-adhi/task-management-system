const notificationRepository = require('../repositories/notificationRepository');

const createNotification = async ({ userId, title, message }) => {
    const notification = await notificationRepository.createNotification(userId, title, message);

    // Emit in real time to the user if they're currently connected.
    // Lazy require avoids a circular dependency — notificationSocket.js
    // requires this file too, so requiring it at the top of this file
    // would create a load-order problem.
    try {
        const { getIO } = require('../sockets/notificationSocket');
        const io = getIO();
        if (io) {
            io.to(`user:${userId}`).emit('new_notification', notification);
        }
    } catch (err) {
        console.error('Failed to emit real-time notification:', err);
    }

    return notification;
};

const getUnreadNotifications = async (userId) => {
    return await notificationRepository.getUnreadNotifications(userId);
};

const getAllNotifications = async (userId) => {
    return await notificationRepository.getAllNotifications(userId);
};

const markAsRead = async (notificationId, userId) => {
    const notification = await notificationRepository.markAsRead(notificationId, userId);
    if (!notification) throw new Error('Notification not found');
    return notification;
};

const markAllAsRead = async (userId) => {
    return await notificationRepository.markAllAsRead(userId);
};

const getAllActiveUserIds = async () => {
    return await notificationRepository.getAllActiveUserIds();
};

const checkUserExists = async (userId) => {
    return await notificationRepository.checkUserExists(userId);
};

// Notification trigger helpers
const notifyTaskAssigned = async ({ assignedUserId, taskTitle, projectName, assignedByName }) => {
    return createNotification({
        userId: assignedUserId,
        title: 'New Task Assigned',
        message: `You have been assigned the task "${taskTitle}" in project "${projectName}" by ${assignedByName}.`
    });
};

const notifyStatusChange = async ({ projectCreatorId, taskTitle, newStatus, changedByName }) => {
    return createNotification({
        userId: projectCreatorId,
        title: 'Task Status Updated',
        message: `Task "${taskTitle}" status changed to "${newStatus}" by ${changedByName}.`
    });
};

const notifyComment = async ({ taskOwnerId, taskTitle, commenterName, projectName }) => {
    return createNotification({
        userId: taskOwnerId,
        title: 'New Comment on Task',
        message: `${commenterName} commented on task "${taskTitle}" in project "${projectName}".`
    });
};

const notifyDeadlineApproaching = async ({ assignedUserId, taskTitle, dueDate }) => {
    const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    });
    return createNotification({
        userId: assignedUserId,
        title: 'Deadline Approaching',
        message: `Task "${taskTitle}" is due on ${dueDateFormatted}. Please ensure timely completion.`
    });
};

const notifyAdminUpdate = async ({ userId, updateMessage }) => {
    return createNotification({
        userId,
        title: 'Administrative Update',
        message: updateMessage
    });
};

module.exports = {
    createNotification,
    getUnreadNotifications,
    getAllNotifications,
    markAsRead,
    markAllAsRead,
    getAllActiveUserIds,
    checkUserExists,
    notifyTaskAssigned,
    notifyStatusChange,
    notifyComment,
    notifyDeadlineApproaching,
    notifyAdminUpdate
};