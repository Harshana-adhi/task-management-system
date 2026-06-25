const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { addCommentSchema } = require('../validators/commentValidator');

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [task_id, comment_text]
 *             properties:
 *               task_id: { type: string, format: uuid }
 *               comment_text: { type: string }
 *     responses:
 *       201:
 *         description: Comment added
 *       400:
 *         description: Task ID and comment text are required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), validate(addCommentSchema), addComment);

/**
 * @swagger
 * /api/comments/{taskId}:
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of comments
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:taskId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getComments);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment (own comments only)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: You can only delete your own comments
 *       404:
 *         description: Comment not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:commentId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), deleteComment);

module.exports = router;