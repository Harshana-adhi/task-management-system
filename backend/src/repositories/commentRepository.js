const pool = require('../config/database');

const createComment = async (taskId, userId, commentText) => {
    const result = await pool.query(
        `INSERT INTO comments (task_id, user_id, comment_text)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [taskId, userId, commentText]
    );
    return result.rows[0];
};

const getCommentsByTask = async (taskId) => {
    const result = await pool.query(
        `SELECT c.*, u.full_name, u.email
         FROM comments c
         JOIN users u ON c.user_id = u.user_id
         WHERE c.task_id = $1
         ORDER BY c.created_at DESC`,
        [taskId]
    );
    return result.rows;
};

const getCommentById = async (commentId) => {
    const result = await pool.query(
        `SELECT * FROM comments WHERE comment_id = $1`,
        [commentId]
    );
    return result.rows[0];
};

const deleteComment = async (commentId) => {
    const result = await pool.query(
        `DELETE FROM comments WHERE comment_id = $1 RETURNING *`,
        [commentId]
    );
    return result.rows[0];
};

module.exports = { createComment, getCommentsByTask, getCommentById, deleteComment };