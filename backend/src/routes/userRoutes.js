const express = require('express');
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    assignRole,
    getAllRoles,
    getUserLookup
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { createUserSchema, updateUserSchema } = require('../validators/userValidator');

/**
 * @swagger
 * /api/users/roles:
 *   get:
 *     summary: Get all available roles
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   role_id: { type: integer }
 *                   role_name: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/roles', authenticate, authorize('Admin'), getAllRoles);

/**
 * @swagger
 * /api/users/lookup:
 *   get:
 *     summary: Lightweight user lookup (for assigning tasks/members)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role_name
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Matching users (minimal fields)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/lookup', authenticate, authorize('Admin', 'Project Manager'), getUserLookup);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, role_id]
 *             properties:
 *               full_name: { type: string, example: Jane Doe }
 *               email: { type: string, format: email }
 *               role_id: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   get:
 *     summary: Get all users, searchable and filterable (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role_id
 *         schema: { type: integer }
 *       - in: query
 *         name: is_active
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticate, authorize('Admin'), validate(createUserSchema), createUser);
router.get('/', authenticate, authorize('Admin'), getAllUsers);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get a user by ID (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update a user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string }
 *               email: { type: string, format: email }
 *               role_id: { type: integer }
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Validation error or email already exists
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:userId', authenticate, authorize('Admin'), getUserById);
router.put('/:userId', authenticate, authorize('Admin'), validate(updateUserSchema), updateUser);

/**
 * @swagger
 * /api/users/{userId}/role:
 *   patch:
 *     summary: Assign a role to a user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role_id]
 *             properties:
 *               role_id: { type: integer }
 *     responses:
 *       200:
 *         description: Role assigned
 *       400:
 *         description: Role ID is required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:userId/role', authenticate, authorize('Admin'), assignRole);

/**
 * @swagger
 * /api/users/{userId}/deactivate:
 *   patch:
 *     summary: Deactivate a user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User deactivated
 *       400:
 *         description: User is already deactivated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:userId/deactivate', authenticate, authorize('Admin'), deactivateUser);

/**
 * @swagger
 * /api/users/{userId}/activate:
 *   patch:
 *     summary: Reactivate a user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User activated
 *       400:
 *         description: User is already active
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:userId/activate', authenticate, authorize('Admin'), activateUser);

module.exports = router;