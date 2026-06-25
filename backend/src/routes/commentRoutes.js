const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { addCommentSchema } = require('../validators/commentValidator');

// Add comment
router.post('/', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), validate(addCommentSchema), addComment);

// Get comments for a task
router.get('/:taskId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getComments);

// Delete comment
router.delete('/:commentId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), deleteComment);

module.exports = router;