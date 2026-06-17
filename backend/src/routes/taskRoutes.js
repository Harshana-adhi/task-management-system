const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/taskController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const {
    createTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema,
    assignTaskSchema
} = require('../validators/taskValidator');

// Filter & Sort Tasks (must be before /:taskId)
router.get('/filter', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getFilteredTasks);

// Create Task
router.post('/', authenticate, authorize('Admin', 'Project Manager'), validate(createTaskSchema), createTask);

// Get All Tasks
router.get('/', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getAllTasks);

// Get Task By ID
router.get('/:taskId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getTaskById);

// Update Task (Admin and Project Manager only)
router.put('/:taskId', authenticate, authorize('Admin', 'Project Manager'), validate(updateTaskSchema), updateTask);

// Update Task Status (All roles)
router.patch('/:taskId/status', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), validate(updateTaskStatusSchema), updateTaskStatus);

// Delete Task
router.delete('/:taskId', authenticate, authorize('Admin', 'Project Manager'), deleteTask);

// Assign Task
router.post('/:taskId/assign', authenticate, authorize('Admin', 'Project Manager'), validate(assignTaskSchema), assignTask);

// Get Task Assignments
router.get('/:taskId/assignments', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getTaskAssignments);

// Remove Assignment
router.delete('/:taskId/assign/:userId', authenticate, authorize('Admin', 'Project Manager'), removeAssignment);

module.exports = router;