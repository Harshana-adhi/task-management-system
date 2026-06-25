const express = require('express');
const router = express.Router();
const { uploadAttachment, getAttachments, deleteAttachment } = require('../controllers/attachmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * /api/attachments/upload:
 *   post:
 *     summary: Upload a file attachment to a task (max 5MB; images, PDFs, Word/Excel docs)
 *     tags: [Attachments]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [task_id, file]
 *             properties:
 *               task_id: { type: string, format: uuid }
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *       400:
 *         description: Task ID or file missing, or invalid file type
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/upload', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), upload.single('file'), uploadAttachment);

/**
 * @swagger
 * /api/attachments/{taskId}:
 *   get:
 *     summary: Get all attachments for a task
 *     tags: [Attachments]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of attachments
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:taskId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getAttachments);

/**
 * @swagger
 * /api/attachments/{attachmentId}:
 *   delete:
 *     summary: Delete an attachment (own uploads only)
 *     tags: [Attachments]
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: You can only delete your own attachments
 *       404:
 *         description: Attachment not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:attachmentId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), deleteAttachment);

module.exports = router;