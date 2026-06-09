const express = require('express');
const router = express.Router();
const { login, changeUserPassword, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// POST /api/auth/login
router.post('/login', login);

// PUT /api/auth/change-password
router.put('/change-password', authenticate, changeUserPassword);

// GET /api/auth/profile
router.get('/profile', authenticate, getProfile);

module.exports = router;