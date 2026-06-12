const pool = require('../config/database');

const createAttachment = async (taskId, uploadedBy, fileName, fileUrl) => {
    const result = await pool.query(
        `INSERT INTO attachments (task_id, uploaded_by, file_name, file_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [taskId, uploadedBy, fileName, fileUrl]
    );
    return result.rows[0];
};

const getAttachmentsByTask = async (taskId) => {
    const result = await pool.query(
        `SELECT a.*, u.full_name, u.email
         FROM attachments a
         JOIN users u ON a.uploaded_by = u.user_id
         WHERE a.task_id = $1
         ORDER BY a.uploaded_at DESC`,
        [taskId]
    );
    return result.rows;
};

const deleteAttachment = async (attachmentId, uploadedBy) => {
    const result = await pool.query(
        `DELETE FROM attachments
         WHERE attachment_id = $1 AND uploaded_by = $2
         RETURNING *`,
        [attachmentId, uploadedBy]
    );
    return result.rows[0];
};

module.exports = { createAttachment, getAttachmentsByTask, deleteAttachment };