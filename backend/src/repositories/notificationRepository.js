const pool = require('../config/database');

const createNotification = async (userId, title, message) => {
    const result = await pool.query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, title, message]
    );
    return result.rows[0];
};

const getUnreadNotifications = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM notifications
         WHERE user_id = $1 AND is_read = FALSE
         ORDER BY created_at ASC`,
        [userId]
    );
    return result.rows;
};

const getAllNotifications = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId]
    );
    return result.rows;
};

const markAsRead = async (notificationId, userId) => {
    const result = await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE notification_id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
    );
    return result.rows[0];
};

const markAllAsRead = async (userId) => {
    await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
    );
};

module.exports = {
    createNotification,
    getUnreadNotifications,
    getAllNotifications,
    markAsRead,
    markAllAsRead
};