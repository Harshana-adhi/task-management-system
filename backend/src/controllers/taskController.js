const taskService = require('../services/taskService');

const createTask = async (req, res) => {
    try {
        const { projectId, title, description, priority, dueDate } = req.body;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        if (!projectId || !title || !priority) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Project ID, title and priority are required'
            });
        }

        const task = await taskService.createTask(
            projectId, title, description, priority, dueDate, userId, userRole
        );

        return res.status(201).json(task);

    } catch (error) {
        const isNotFound = error.message === 'Project not found';
        const isForbidden = error.message === 'You can only create tasks in your own projects';
        const isConflict = error.message === 'Task with this title already exists in this project';
        const status = isNotFound ? 404 : isForbidden ? 403 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isConflict ? 'Conflict' : 'Internal Server Error',
            message: error.message
        });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const { projectId } = req.query;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        if (!projectId) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Project ID is required'
            });
        }

        const tasks = await taskService.getAllTasks(projectId, userId, userRole);
        return res.status(200).json(tasks);

    } catch (error) {
        const isNotFound = error.message === 'Project not found';
        const isAccessDenied = error.message === 'Access denied';
        const status = isNotFound ? 404 : isAccessDenied ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isAccessDenied ? 'Forbidden' : 'Internal Server Error',
            message: isNotFound ? error.message : isAccessDenied ? error.message : 'Failed to fetch tasks'
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        const task = await taskService.getTaskById(taskId, userId, userRole);
        return res.status(200).json(task);

    } catch (error) {
        const isNotFound = error.message === 'Task not found';
        const isForbidden = error.message === 'Access denied';
        const status = isNotFound ? 404 : isForbidden ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : 'Internal Server Error',
            message: error.message
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, status, priority, due_date } = req.body;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        const task = await taskService.updateTask(
            taskId,
            { title, description, status, priority, due_date },
            userId,
            userRole
        );

        return res.status(200).json(task);

    } catch (error) {
        const isNotFound = error.message === 'Task not found';
        const isForbidden = error.message === 'You can only update tasks in your own projects';
        const isNoFields = error.message === 'No valid fields to update';
        const isConflict = error.message === 'Task with this title already exists in this project';
        const status = isNotFound ? 404 : isForbidden ? 403 : isNoFields ? 400 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isNoFields ? 'Bad Request' : isConflict ? 'Conflict' : 'Internal Server Error',
            message: error.message
        });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        if (!status) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Status is required'
            });
        }

        const task = await taskService.updateTaskStatus(taskId, status, userId, userRole);
        return res.status(200).json(task);

    } catch (error) {
        const isNotFound = error.message === 'Task not found';
        const isForbidden = error.message === 'You can only update status of tasks assigned to you';
        const status = isNotFound ? 404 : isForbidden ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : 'Internal Server Error',
            message: error.message
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        const deletedTask = await taskService.deleteTask(taskId, userId, userRole);

        if (!deletedTask) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Task not found'
            });
        }

        return res.status(200).json({ message: 'Task deleted successfully' });

    } catch (error) {
        const isNotFound = error.message === 'Task not found';
        const isForbidden = error.message === 'You can only delete tasks in your own projects';
        const status = isNotFound ? 404 : isForbidden ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : 'Internal Server Error',
            message: error.message
        });
    }
};

const assignTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user.user_id;
        const userRole = req.user.role_name;

        if (!userId) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'User ID is required'
            });
        }

        const assignment = await taskService.assignTask(taskId, userId, requesterId, userRole);
        return res.status(201).json({
            message: 'Task assigned successfully',
            assignment
        });

    } catch (error) {
        const isNotFound = error.message === 'Task not found' || error.message === 'User not found';
        const isForbidden = error.message === 'You can only assign tasks in your own projects';
        const isBadRole = error.message === 'Tasks can only be assigned to Collaborators';
        const isConflict = error.message === 'User is already assigned to this task';
        const status = isNotFound ? 404 : isForbidden ? 403 : isBadRole ? 400 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isBadRole ? 'Bad Request' : isConflict ? 'Conflict' : 'Internal Server Error',
            message: error.message
        });
    }
};

const getTaskAssignments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const assignments = await taskService.getTaskAssignments(taskId);
        return res.status(200).json(assignments);

    } catch (error) {
        const isNotFound = error.message === 'Task not found';
        return res.status(isNotFound ? 404 : 500).json({
            error: isNotFound ? 'Not Found' : 'Internal Server Error',
            message: error.message
        });
    }
};

const removeAssignment = async (req, res) => {
    try {
        const { taskId, userId } = req.params;
        const requesterId = req.user.user_id;
        const userRole = req.user.role_name;

        await taskService.removeAssignment(taskId, userId, requesterId, userRole);

        return res.status(200).json({ message: 'Assignment removed successfully' });

    } catch (error) {
        const isNotFound = error.message === 'Task not found' ||
                           error.message === 'Assignment not found';
        const isForbidden = error.message === 'You can only manage assignments in your own projects';
        const status = isNotFound ? 404 : isForbidden ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : 'Internal Server Error',
            message: error.message
        });
    }
};

const getFilteredTasks = async (req, res) => {
    try {
        const { projectId, status, priority } = req.query;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        if (!projectId) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Project ID is required'
            });
        }

        const tasks = await taskService.getFilteredTasks(projectId, userId, userRole, status, priority);
        return res.status(200).json(tasks);

    } catch (error) {
        const isAccessDenied = error.message === 'Access denied';
        return res.status(isAccessDenied ? 403 : 500).json({
            error: isAccessDenied ? 'Forbidden' : 'Internal Server Error',
            message: isAccessDenied ? error.message : 'Failed to filter tasks'
        });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    deleteTask,
    assignTask,
    getTaskAssignments,
    removeAssignment,
    getFilteredTasks
};