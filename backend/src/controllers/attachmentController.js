const attachmentService = require('../services/attachmentService');

const uploadAttachment = async (req, res) => {
    try {
        const { task_id } = req.body;
        const uploadedBy = req.user.user_id;
        const userRole = req.user.role_name;

        if (!task_id) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Task ID is required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'File is required'
            });
        }

        const fileName = req.file.originalname;
        const fileUrl = `/uploads/${req.file.filename}`;

        const attachment = await attachmentService.uploadAttachment(
            task_id, uploadedBy, fileName, fileUrl, userRole
        );

        return res.status(201).json({
            message: 'Attachment uploaded successfully',
            attachment
        });

    } catch (error) {
        const isNotFound = error.message === 'Task not found';
        const isAccessDenied = error.message === 'Access denied';
        const status = isNotFound ? 404 : isAccessDenied ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isAccessDenied ? 'Forbidden' : 'Internal Server Error',
            message: isNotFound || isAccessDenied ? error.message : 'Failed to upload attachment'
        });
    }
};

const getAttachments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        const attachments = await attachmentService.getTaskAttachments(taskId, userId, userRole);
        return res.status(200).json(attachments);

    } catch (error) {
        const isNotFound = error.message === 'Task not found';
        const isAccessDenied = error.message === 'Access denied';
        const status = isNotFound ? 404 : isAccessDenied ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isAccessDenied ? 'Forbidden' : 'Internal Server Error',
            message: isNotFound || isAccessDenied ? error.message : 'Failed to fetch attachments'
        });
    }
};

const deleteAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        await attachmentService.deleteAttachment(attachmentId, userId, userRole);

        return res.status(200).json({
            message: 'Attachment deleted successfully'
        });

    } catch (error) {
        const isNotFound = error.message === 'Attachment not found';
        const isForbidden = error.message === 'You can only delete your own attachments';
        const status = isNotFound ? 404 : isForbidden ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports = { uploadAttachment, getAttachments, deleteAttachment };