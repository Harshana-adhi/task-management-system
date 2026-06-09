const express = require('express');

const router = express.Router();

const {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    assignTask,
    getFilteredTasks
} = require('../controllers/taskController');

const {
    authenticate,
    authorize
} = require('../middlewares/authMiddleware');

// Create Task
router.post(
    '/',
    authenticate,
    authorize('Admin', 'Project Manager'),
    createTask
);

// View All Tasks
router.get(
    '/',
    authenticate,
    authorize('Admin', 'Project Manager', 'Collaborator'),
    getTasks
);


// Filter & Sort Tasks
router.get(
    '/filter',
    authenticate,
    getFilteredTasks
);

router.get(
    '/',
    authenticate,
    authorize('Admin', 'Project Manager', 'Collaborator'),
    getTasks
);

// Assign Task To User
router.post(
    '/:taskId/assign',
    authenticate,
    authorize('Admin', 'Project Manager'),
    assignTask
);

// Update Task
router.put(
    '/:taskId',
    authenticate,
    authorize('Admin', 'Project Manager'),
    updateTask
);

// Delete Task
router.delete(
    '/:taskId',
    authenticate,
    authorize('Admin', 'Project Manager'),
    deleteTask
);

module.exports = router;