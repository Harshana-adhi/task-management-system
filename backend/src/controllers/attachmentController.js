const attachmentService = require('../services/attachmentService');

const uploadAttachment = async (req, res) => {
    try {
        const { task_id } = req.body;
        const uploadedBy = req.user.user_id;

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
        const fileUrl = req.file.path;

        const attachment = await attachmentService.uploadAttachment(
            task_id, uploadedBy, fileName, fileUrl
        );

        return res.status(201).json({
            message: 'Attachment uploaded successfully',
            attachment
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to upload attachment'
        });
    }
};

const getAttachments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const attachments = await attachmentService.getTaskAttachments(taskId);

        return res.status(200).json(attachments);

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch attachments'
        });
    }
};

const deleteAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;
        const uploadedBy = req.user.user_id;

        await attachmentService.deleteAttachment(attachmentId, uploadedBy);

        return res.status(200).json({
            message: 'Attachment deleted successfully'
        });

    } catch (error) {
        const isNotFound = error.message === 'Attachment not found or unauthorized';
        return res.status(isNotFound ? 404 : 500).json({
            error: isNotFound ? 'Not Found' : 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports = { uploadAttachment, getAttachments, deleteAttachment };

