const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Add comment
router.post('/', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), addComment);

// Get comments for a task
router.get('/:taskId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getComments);

// Delete comment
router.delete('/:commentId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), deleteComment);

module.exports = router;