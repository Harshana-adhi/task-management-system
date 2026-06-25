const pool = require('../config/database');

const assignTask = async (taskId, userId) => {
    // Check if already assigned
    const existing = await pool.query(
        'SELECT * FROM task_assignments WHERE task_id = $1 AND user_id = $2',
        [taskId, userId]
    );
    if (existing.rows.length > 0) {
        throw new Error('User is already assigned to this task');
    }

    const result = await pool.query(
        `INSERT INTO task_assignments (task_id, user_id) VALUES ($1, $2) RETURNING *`,
        [taskId, userId]
    );
    return result.rows[0];
};

const getTaskAssignments = async (taskId) => {
    const result = await pool.query(
        `SELECT ta.*, u.full_name, u.email
         FROM task_assignments ta
         JOIN users u ON ta.user_id = u.user_id
         WHERE ta.task_id = $1`,
        [taskId]
    );
    return result.rows;
};

const removeAssignment = async (taskId, userId) => {
    const result = await pool.query(
        `DELETE FROM task_assignments
         WHERE task_id = $1 AND user_id = $2
         RETURNING *`,
        [taskId, userId]
    );
    return result.rows[0];
};

const isUserAssignedToTask = async (taskId, userId) => {
    const result = await pool.query(
        'SELECT * FROM task_assignments WHERE task_id = $1 AND user_id = $2',
        [taskId, userId]
    );
    return result.rows.length > 0;
};

module.exports = {
    assignTask,
    getTaskAssignments,
    removeAssignment,
    isUserAssignedToTask
};