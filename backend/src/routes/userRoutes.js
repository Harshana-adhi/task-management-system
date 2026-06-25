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

// Get all roles
router.get('/roles', authenticate, authorize('Admin'), getAllRoles);

// Get user lookup
router.get('/lookup', authenticate, authorize('Admin', 'Project Manager'), getUserLookup);

// Create user (Admin only)
router.post('/', authenticate, authorize('Admin'), validate(createUserSchema), createUser);

// Get all users (Admin only) - searchable & filterable
router.get('/', authenticate, authorize('Admin'), getAllUsers);

// Get user by ID (Admin only)
router.get('/:userId', authenticate, authorize('Admin'), getUserById);

// Update user (Admin only)
router.put('/:userId', authenticate, authorize('Admin'), validate(updateUserSchema), updateUser);

// Assign role to user (Admin only)
router.patch('/:userId/role', authenticate, authorize('Admin'), assignRole);

// Deactivate user (Admin only)
router.patch('/:userId/deactivate', authenticate, authorize('Admin'), deactivateUser);

// Activate user (Admin only)
router.patch('/:userId/activate', authenticate, authorize('Admin'), activateUser);

module.exports = router;