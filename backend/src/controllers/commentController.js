const commentService = require('../services/commentService');

const addComment = async (req, res) => {
    try {
        const { task_id, comment_text } = req.body;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        if (!task_id || !comment_text) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Task ID and comment text are required'
            });
        }

        const comment = await commentService.addComment(task_id, userId, comment_text, userRole);

        return res.status(201).json({
            message: 'Comment added successfully',
            comment
        });

    } catch (error) {
        const isNotFound = error.message === 'Task not found';
        const isAccessDenied = error.message === 'Access denied';
        const status = isNotFound ? 404 : isAccessDenied ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isAccessDenied ? 'Forbidden' : 'Internal Server Error',
            message: isNotFound || isAccessDenied ? error.message : 'Failed to add comment'
        });
    }
};

const getComments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        const comments = await commentService.getTaskComments(taskId, userId, userRole);
        return res.status(200).json(comments);

    } catch (error) {
        const isNotFound = error.message === 'Task not found';
        const isAccessDenied = error.message === 'Access denied';
        const status = isNotFound ? 404 : isAccessDenied ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isAccessDenied ? 'Forbidden' : 'Internal Server Error',
            message: isNotFound || isAccessDenied ? error.message : 'Failed to fetch comments'
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        await commentService.deleteComment(commentId, userId, userRole);

        return res.status(200).json({
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        const isNotFound = error.message === 'Comment not found';
        const isForbidden = error.message === 'You can only delete your own comments';
        const status = isNotFound ? 404 : isForbidden ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports = { addComment, getComments, deleteComment };