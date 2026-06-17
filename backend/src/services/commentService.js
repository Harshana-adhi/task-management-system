const commentRepository = require('../repositories/commentRepository');
const { checkTaskAccess } = require('../utils/taskAccessHelper');
const pool = require('../config/database');
const notificationService = require('./notificationService');

// Check if task exists
const checkTaskExists = async (taskId) => {
    const result = await pool.query(
        'SELECT task_id FROM tasks WHERE task_id = $1',
        [taskId]
    );
    return result.rows.length > 0;
};

const addComment = async (taskId, userId, commentText, userRole) => {
    if (!taskId || !userId || !commentText) {
        throw new Error('Task ID, user ID and comment text are required');
    }

    // Check task exists
    const taskExists = await checkTaskExists(taskId);
    if (!taskExists) throw new Error('Task not found');

    // Check access
    const hasAccess = await checkTaskAccess(taskId, userId, userRole);
    if (!hasAccess) throw new Error('Access denied');

    const comment = await commentRepository.createComment(taskId, userId, commentText);

    // Notify task creator about new comment (non-blocking)
    try {
        const taskResult = await pool.query(
            `SELECT t.title, t.created_by, p.project_name
             FROM tasks t
             JOIN projects p ON t.project_id = p.project_id
             WHERE t.task_id = $1`,
            [taskId]
        );

        if (taskResult.rows.length > 0) {
            const task = taskResult.rows[0];

            // Don't notify if the commenter is the task creator
            if (task.created_by !== userId) {
                const userResult = await pool.query(
                    'SELECT full_name FROM users WHERE user_id = $1',
                    [userId]
                );
                const commenterName = userResult.rows[0]?.full_name || 'Someone';

                await notificationService.notifyComment({
                    taskOwnerId: task.created_by,
                    taskTitle: task.title,
                    commenterName,
                    projectName: task.project_name
                });
            }
        }
    } catch (notifyError) {
        console.error('Failed to send comment notification:', notifyError);
    }

    return comment;
};

const getTaskComments = async (taskId, userId, userRole) => {
    if (!taskId) throw new Error('Task ID is required');

    // Check task exists
    const taskExists = await checkTaskExists(taskId);
    if (!taskExists) throw new Error('Task not found');

    // Check access
    const hasAccess = await checkTaskAccess(taskId, userId, userRole);
    if (!hasAccess) throw new Error('Access denied');

    return await commentRepository.getCommentsByTask(taskId);
};

const deleteComment = async (commentId, userId, userRole) => {
    const comment = await commentRepository.getCommentById(commentId);
    if (!comment) throw new Error('Comment not found');

    // Admin can delete any comment
    // Others can only delete their own comments
    if (userRole !== 'Admin' && comment.user_id !== userId) {
        throw new Error('You can only delete your own comments');
    }

    return await commentRepository.deleteComment(commentId);
};

module.exports = { addComment, getTaskComments, deleteComment };