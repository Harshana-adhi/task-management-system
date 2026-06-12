const commentRepository = require('../repositories/commentRepository');

const addComment = async (taskId, userId, commentText) => {
    if (!taskId || !userId || !commentText) {
        throw new Error('Task ID, user ID and comment text are required');
    }
    return await commentRepository.createComment(taskId, userId, commentText);
};

const getTaskComments = async (taskId) => {
    if (!taskId) throw new Error('Task ID is required');
    return await commentRepository.getCommentsByTask(taskId);
};

const deleteComment = async (commentId, userId) => {
    const deleted = await commentRepository.deleteComment(commentId, userId);
    if (!deleted) throw new Error('Comment not found or unauthorized');
    return deleted;
};

module.exports = { addComment, getTaskComments, deleteComment };