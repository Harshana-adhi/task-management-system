const pool = require('../config/database');
const taskRepository = require('../repositories/taskRepository');
const taskAssignmentRepository = require('../repositories/taskAssignmentRepository');
const notificationService = require('./notificationService');

// A Project Manager can act on a project if they created it OR were
// assigned to co-manage it by an Admin (see Phase 4's projectService —
// same rule, mirrored here so task permissions stay consistent with
// project permissions).
const checkProjectOwnership = async (projectId, userId) => {
    const result = await pool.query(
        'SELECT * FROM projects WHERE project_id = $1 AND (created_by = $2 OR assigned_manager_id = $2)',
        [projectId, userId]
    );
    return result.rows.length > 0;
};

const createTask = async (projectId, title, description, priority, dueDate, createdBy, userRole) => {
    // Check if project exists
    const projectResult = await pool.query(
        'SELECT * FROM projects WHERE project_id = $1',
        [projectId]
    );
    if (projectResult.rows.length === 0) {
        throw new Error('Project not found');
    }

    // Project Manager can only create tasks in their own projects OR
    // projects they're assigned to co-manage
    const project = projectResult.rows[0];
    if (userRole === 'Project Manager' && project.created_by !== createdBy && project.assigned_manager_id !== createdBy) {
        throw new Error('You can only create tasks in your own projects');
    }

    return await taskRepository.createTask(projectId, title, description, priority, dueDate, createdBy);
};

const getTaskById = async (taskId, userId, userRole) => {
    const task = await taskRepository.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    if (userRole === 'Project Manager') {
        if (task.project_created_by !== userId && task.project_assigned_manager_id !== userId) {
            throw new Error('Access denied');
        }
    }

    if (userRole === 'Collaborator') {
        const isAssigned = await taskAssignmentRepository.isUserAssignedToTask(taskId, userId);
        if (!isAssigned) throw new Error('Access denied');
    }

    return task;
};

const getAllTasks = async (projectId, userId, userRole) => {
    // Check if project exists first
    const projectResult = await pool.query(
        'SELECT * FROM projects WHERE project_id = $1',
        [projectId]
    );
    if (projectResult.rows.length === 0) {
        throw new Error('Project not found');
    }

    // Project Manager can only view tasks in their own projects
    if (userRole === 'Project Manager') {
        const ownsProject = await checkProjectOwnership(projectId, userId);
        if (!ownsProject) throw new Error('Access denied');
    }

    return await taskRepository.getAllTasks(projectId, userId, userRole);
};

const getAssignedTasks = async (userId) => {
    return await taskRepository.getAssignedTasks(userId);
};

const updateTask = async (taskId, fields, userId, userRole) => {
    const task = await taskRepository.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    if (userRole === 'Project Manager' && task.project_created_by !== userId && task.project_assigned_manager_id !== userId) {
        throw new Error('You can only update tasks in your own projects');
    }

    return await taskRepository.updateTask(taskId, fields);
};

const updateTaskStatus = async (taskId, status, userId, userRole) => {
    const task = await taskRepository.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    if (userRole === 'Collaborator') {
        const isAssigned = await taskAssignmentRepository.isUserAssignedToTask(taskId, userId);
        if (!isAssigned) throw new Error('You can only update status of tasks assigned to you');
    }

    const updatedTask = await taskRepository.updateTaskStatus(taskId, status);

    // Notify project owner(s) about status change (non-blocking).
    // Notifies both the project creator and the assigned co-manager (if
    // one exists and differs) — same co-manager rule as everywhere else.
    // Never notifies the person who made the change themselves.
    try {
        const userResult = await pool.query(
            'SELECT full_name FROM users WHERE user_id = $1',
            [userId]
        );
        const changedByName = userResult.rows[0]?.full_name || 'Someone';

        const recipients = new Set(
            [task.project_created_by, task.project_assigned_manager_id].filter(Boolean)
        );
        recipients.delete(userId);

        for (const recipientId of recipients) {
            await notificationService.notifyStatusChange({
                projectCreatorId: recipientId,
                taskTitle: task.title,
                newStatus: status,
                changedByName
            });
        }
    } catch (notifyError) {
        console.error('Failed to send status change notification:', notifyError);
    }

    return updatedTask;
};

const deleteTask = async (taskId, userId, userRole) => {
    const task = await taskRepository.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    if (userRole === 'Project Manager' && task.project_created_by !== userId && task.project_assigned_manager_id !== userId) {
        throw new Error('You can only delete tasks in your own projects');
    }

    return await taskRepository.deleteTask(taskId);
};

const getFilteredTasks = async (projectId, userId, userRole, status, priority) => {
    // Project Manager can only filter tasks in their own projects
    if (userRole === 'Project Manager') {
        const ownsProject = await checkProjectOwnership(projectId, userId);
        if (!ownsProject) throw new Error('Access denied');
    }

    return await taskRepository.getFilteredTasks(projectId, userId, userRole, status, priority);
};

const assignTask = async (taskId, userId, requesterId, userRole) => {
    const task = await taskRepository.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    if (userRole === 'Project Manager' && task.project_created_by !== requesterId && task.project_assigned_manager_id !== requesterId) {
        throw new Error('You can only assign tasks in your own projects');
    }

    // Check that the user being assigned is a Collaborator
    const userResult = await pool.query(
        `SELECT u.user_id, u.full_name, r.role_name
         FROM users u
         JOIN roles r ON u.role_id = r.role_id
         WHERE u.user_id = $1`,
        [userId]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found');
    }

    if (userResult.rows[0].role_name !== 'Collaborator') {
        throw new Error('Tasks can only be assigned to Collaborators');
    }

    const assignment = await taskAssignmentRepository.assignTask(taskId, userId);

    // Notify assigned user (non-blocking)
    try {
        const requesterResult = await pool.query(
            'SELECT full_name FROM users WHERE user_id = $1',
            [requesterId]
        );
        const projectResult = await pool.query(
            'SELECT project_name FROM projects WHERE project_id = $1',
            [task.project_id]
        );
        const assignedByName = requesterResult.rows[0]?.full_name || 'Someone';
        const projectName = projectResult.rows[0]?.project_name || 'a project';

        await notificationService.notifyTaskAssigned({
            assignedUserId: userId,
            taskTitle: task.title,
            projectName,
            assignedByName
        });
    } catch (notifyError) {
        console.error('Failed to send task assignment notification:', notifyError);
    }

    return assignment;
};

const getTaskAssignments = async (taskId) => {
    const task = await taskRepository.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    return await taskAssignmentRepository.getTaskAssignments(taskId);
};

const removeAssignment = async (taskId, userId, requesterId, userRole) => {
    const task = await taskRepository.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    if (userRole === 'Project Manager' && task.project_created_by !== requesterId && task.project_assigned_manager_id !== requesterId) {
        throw new Error('You can only manage assignments in your own projects');
    }

    const removed = await taskAssignmentRepository.removeAssignment(taskId, userId);
    if (!removed) throw new Error('Assignment not found');
    return removed;
};

module.exports = {
    createTask,
    getTaskById,
    getAllTasks,
    getAssignedTasks,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getFilteredTasks,
    assignTask,
    getTaskAssignments,
    removeAssignment
};