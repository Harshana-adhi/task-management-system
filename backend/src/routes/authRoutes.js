const express = require('express');
const router = express.Router();
const { login, changeUserPassword, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { loginSchema, changePasswordSchema } = require('../validators/authValidator');

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// PUT /api/auth/change-password
router.put('/change-password', authenticate, validate(changePasswordSchema), changeUserPassword);

// GET /api/auth/profile
router.get('/profile', authenticate, getProfile);

module.exports = router;