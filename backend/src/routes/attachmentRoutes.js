const express = require('express');
const router = express.Router();
const { uploadAttachment, getAttachments, deleteAttachment } = require('../controllers/attachmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Upload attachment
router.post('/upload', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), upload.single('file'), uploadAttachment);

// Get attachments for a task
router.get('/:taskId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getAttachments);

// Delete attachment
router.delete('/:attachmentId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), deleteAttachment);

module.exports = router;