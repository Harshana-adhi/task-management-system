const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

// Create and store a notification
const createNotification = async ({ userId, title, message }) => {
    const notificationId = uuidv4();
    const query = `
        INSERT INTO notifications (notification_id, user_id, title, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const result = await pool.query(query, [notificationId, userId, title, message]);
    return result.rows[0];
};

// Get all unread notifications for a user (for offline delivery)
const getUnreadNotifications = async (userId) => {
    const query = `
        SELECT * FROM notifications
        WHERE user_id = $1 AND is_read = FALSE
        ORDER BY created_at ASC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

// Get all notifications for a user (read + unread)
const getAllNotifications = async (userId) => {
    const query = `
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

// Mark a single notification as read
const markAsRead = async (notificationId, userId) => {
    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = $1 AND user_id = $2
        RETURNING *;
    `;
    const result = await pool.query(query, [notificationId, userId]);
    return result.rows[0];
};

// Mark all notifications as read for a user
const markAllAsRead = async (userId) => {
    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1 AND is_read = FALSE;
    `;
    await pool.query(query, [userId]);
};

// ── Notification Trigger Helpers ────────────────────────────

// Task assignment notification
const notifyTaskAssigned = async ({ assignedUserId, taskTitle, projectName, assignedByName }) => {
    return createNotification({
        userId: assignedUserId,
        title: 'New Task Assigned',
        message: `You have been assigned the task "${taskTitle}" in project "${projectName}" by ${assignedByName}.`
    });
};

// Task status change notification
const notifyStatusChange = async ({ projectCreatorId, taskTitle, newStatus, changedByName }) => {
    return createNotification({
        userId: projectCreatorId,
        title: 'Task Status Updated',
        message: `Task "${taskTitle}" status changed to "${newStatus}" by ${changedByName}.`
    });
};

// Comment notification
const notifyComment = async ({ taskOwnerId, taskTitle, commenterName, projectName }) => {
    return createNotification({
        userId: taskOwnerId,
        title: 'New Comment on Task',
        message: `${commenterName} commented on task "${taskTitle}" in project "${projectName}".`
    });
};

// Approaching deadline notification
const notifyDeadlineApproaching = async ({ assignedUserId, taskTitle, dueDate }) => {
    const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    });
    return createNotification({
        userId: assignedUserId,
        title: '⚠️ Deadline Approaching',
        message: `Task "${taskTitle}" is due on ${dueDateFormatted}. Please ensure timely completion.`
    });
};

// Administrative update notification
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
    notifyTaskAssigned,
    notifyStatusChange,
    notifyComment,
    notifyDeadlineApproaching,
    notifyAdminUpdate
};
