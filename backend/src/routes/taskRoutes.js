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
    getFilteredTasks,
    getMyTasks
} = require('../controllers/taskController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const {
    createTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema,
    assignTaskSchema
} = require('../validators/taskValidator');

/**
 * @swagger
 * /api/tasks/filter:
 *   get:
 *     summary: Filter and sort tasks within a project
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [To Do, In Progress, Completed] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [Low, Medium, High] }
 *     responses:
 *       200:
 *         description: Filtered list of tasks
 *       400:
 *         description: Project ID is required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/filter', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getFilteredTasks);

/**
 * @swagger
 * /api/tasks/my-tasks:
 *   get:
 *     summary: Get all tasks assigned to the current user, across all projects
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of assigned tasks
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/my-tasks', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getMyTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task within a project
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, title, priority]
 *             properties:
 *               projectId: { type: string, format: uuid }
 *               title: { type: string }
 *               description: { type: string }
 *               priority: { type: string, enum: [Low, Medium, High] }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Project ID, title and priority are required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: You can only create tasks in your own projects
 *       404:
 *         description: Project not found
 *       409:
 *         description: Task with this title already exists in this project
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   get:
 *     summary: Get all tasks for a project
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of tasks
 *       400:
 *         description: Project ID is required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Project not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticate, authorize('Admin', 'Project Manager'), validate(createTaskSchema), createTask);
router.get('/', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getAllTasks);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task details
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update a task (Admin and Project Manager only)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [To Do, In Progress, Completed] }
 *               priority: { type: string, enum: [Low, Medium, High] }
 *               due_date: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: No valid fields to update
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: You can only update tasks in your own projects
 *       404:
 *         description: Task not found
 *       409:
 *         description: Task with this title already exists in this project
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: You can only delete tasks in your own projects
 *       404:
 *         description: Task not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:taskId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getTaskById);
router.put('/:taskId', authenticate, authorize('Admin', 'Project Manager'), validate(updateTaskSchema), updateTask);
router.delete('/:taskId', authenticate, authorize('Admin', 'Project Manager'), deleteTask);

/**
 * @swagger
 * /api/tasks/{taskId}/status:
 *   patch:
 *     summary: Update a task's status (any project role; Collaborators limited to tasks assigned to them)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [To Do, In Progress, Completed] }
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Status is required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: You can only update status of tasks assigned to you
 *       404:
 *         description: Task not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:taskId/status', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), validate(updateTaskStatusSchema), updateTaskStatus);

/**
 * @swagger
 * /api/tasks/{taskId}/assign:
 *   post:
 *     summary: Assign a task to a user (Collaborators only)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Task assigned
 *       400:
 *         description: Missing user ID, or target user is not a Collaborator
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: You can only assign tasks in your own projects
 *       404:
 *         description: Task or user not found
 *       409:
 *         description: User is already assigned to this task
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   get:
 *     summary: Get assignments for a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of assignments
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Task not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:taskId/assign', authenticate, authorize('Admin', 'Project Manager'), validate(assignTaskSchema), assignTask);
router.get('/:taskId/assignments', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), getTaskAssignments);

/**
 * @swagger
 * /api/tasks/{taskId}/assign/{userId}:
 *   delete:
 *     summary: Remove a user's assignment from a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Assignment removed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: You can only manage assignments in your own projects
 *       404:
 *         description: Task or assignment not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:taskId/assign/:userId', authenticate, authorize('Admin', 'Project Manager'), removeAssignment);

module.exports = router;