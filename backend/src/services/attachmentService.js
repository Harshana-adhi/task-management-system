const attachmentRepository = require('../repositories/attachmentRepository');
const { checkTaskAccess } = require('../utils/taskAccessHelper');
const pool = require('../config/database');

// Check if task exists
const checkTaskExists = async (taskId) => {
    const result = await pool.query(
        'SELECT task_id FROM tasks WHERE task_id = $1',
        [taskId]
    );
    return result.rows.length > 0;
};

const uploadAttachment = async (taskId, uploadedBy, fileName, fileUrl, userRole) => {
    if (!taskId || !uploadedBy || !fileName || !fileUrl) {
        throw new Error('All attachment fields are required');
    }

    // Check task exists
    const taskExists = await checkTaskExists(taskId);
    if (!taskExists) throw new Error('Task not found');

    // Check access
    const hasAccess = await checkTaskAccess(taskId, uploadedBy, userRole);
    if (!hasAccess) throw new Error('Access denied');

    return await attachmentRepository.createAttachment(taskId, uploadedBy, fileName, fileUrl);
};

const getTaskAttachments = async (taskId, userId, userRole) => {
    if (!taskId) throw new Error('Task ID is required');

    // Check task exists
    const taskExists = await checkTaskExists(taskId);
    if (!taskExists) throw new Error('Task not found');

    // Check access
    const hasAccess = await checkTaskAccess(taskId, userId, userRole);
    if (!hasAccess) throw new Error('Access denied');

    return await attachmentRepository.getAttachmentsByTask(taskId);
};

const deleteAttachment = async (attachmentId, userId, userRole) => {
    const attachment = await attachmentRepository.getAttachmentById(attachmentId);
    if (!attachment) throw new Error('Attachment not found');

    // Admin can delete any attachment
    // Others can only delete their own attachments
    if (userRole !== 'Admin' && attachment.uploaded_by !== userId) {
        throw new Error('You can only delete your own attachments');
    }

    return await attachmentRepository.deleteAttachment(attachmentId);
};

module.exports = { uploadAttachment, getTaskAttachments, deleteAttachment };