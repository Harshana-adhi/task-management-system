const attachmentRepository = require('../repositories/attachmentRepository');

const uploadAttachment = async (taskId, uploadedBy, fileName, fileUrl) => {
    if (!taskId || !uploadedBy || !fileName || !fileUrl) {
        throw new Error('All attachment fields are required');
    }
    return await attachmentRepository.createAttachment(taskId, uploadedBy, fileName, fileUrl);
};

const getTaskAttachments = async (taskId) => {
    if (!taskId) throw new Error('Task ID is required');
    return await attachmentRepository.getAttachmentsByTask(taskId);
};

const deleteAttachment = async (attachmentId, uploadedBy) => {
    const deleted = await attachmentRepository.deleteAttachment(attachmentId, uploadedBy);
    if (!deleted) throw new Error('Attachment not found or unauthorized');
    return deleted;
};

module.exports = { uploadAttachment, getTaskAttachments, deleteAttachment };