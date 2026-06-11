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
    getAllRoles
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Get all roles
router.get('/roles', authenticate, authorize('Admin'), getAllRoles);

// Create user (Admin only)
router.post('/', authenticate, authorize('Admin'), createUser);

// Get all users (Admin only) - searchable & filterable
router.get('/', authenticate, authorize('Admin'), getAllUsers);

// Get user by ID (Admin only)
router.get('/:userId', authenticate, authorize('Admin'), getUserById);

// Update user (Admin only)
router.put('/:userId', authenticate, authorize('Admin'), updateUser);

// Assign role to user (Admin only)
router.patch('/:userId/role', authenticate, authorize('Admin'), assignRole);

// Deactivate user (Admin only)
router.patch('/:userId/deactivate', authenticate, authorize('Admin'), deactivateUser);

// Activate user (Admin only)
router.patch('/:userId/activate', authenticate, authorize('Admin'), activateUser);

module.exports = router;