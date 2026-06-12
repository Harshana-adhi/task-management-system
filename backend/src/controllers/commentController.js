const commentService = require('../services/commentService');

const addComment = async (req, res) => {
    try {
        const { task_id, comment_text } = req.body;
        const userId = req.user.user_id;

        if (!task_id || !comment_text) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Task ID and comment text are required'
            });
        }

        const comment = await commentService.addComment(task_id, userId, comment_text);

        return res.status(201).json({
            message: 'Comment added successfully',
            comment
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to add comment'
        });
    }
};

const getComments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const comments = await commentService.getTaskComments(taskId);

        return res.status(200).json(comments);

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch comments'
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.user_id;

        await commentService.deleteComment(commentId, userId);

        return res.status(200).json({
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        const isNotFound = error.message === 'Comment not found or unauthorized';
        return res.status(isNotFound ? 404 : 500).json({
            error: isNotFound ? 'Not Found' : 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports = { addComment, getComments, deleteComment };