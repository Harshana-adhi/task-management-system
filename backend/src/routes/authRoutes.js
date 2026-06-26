const express = require('express');
const router = express.Router();
const { login, changeUserPassword, getProfile, requestPasswordReset } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { loginSchema, changePasswordSchema, forgotPasswordSchema } = require('../validators/authValidator');
const { loginLimiter, forgotPasswordLimiter } = require('../middlewares/rateLimitMiddleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and receive a JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: user@example.com }
 *               password: { type: string, format: password, example: SecurePass123 }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Login successful }
 *                 token: { type: string }
 *                 mustChangePassword: { type: boolean }
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id: { type: string, format: uuid }
 *                     full_name: { type: string }
 *                     email: { type: string }
 *                     role_name: { type: string }
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Account has been deactivated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *             example: { error: Account Deactivated, message: "This account has been deactivated. Please contact an administrator." }
 *       429:
 *         description: Too many login attempts (rate limited)
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', loginLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a temporary password be emailed to an account
 *     description: >
 *       Always returns the same generic message regardless of whether the
 *       email matches an active account — this is intentional, to avoid
 *       letting the endpoint be used to discover which emails are
 *       registered. If a match is found, a new temporary password is
 *       generated, stored, and emailed; the account's must-change-password
 *       flag is set so the person is forced to set their own password
 *       right after logging in with it.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: user@example.com }
 *     responses:
 *       200:
 *         description: Generic confirmation (sent regardless of whether the email matched an account)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: If an account exists for that email, a temporary password has been sent. }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: Too many reset requests (rate limited)
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), requestPasswordReset);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change the current user's password
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { type: object }
 *       400:
 *         description: Validation error (incorrect current password, too short, same as old)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/change-password', authenticate, validate(changePasswordSchema), changeUserPassword);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user profile (password hash excluded)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { type: object }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/profile', authenticate, getProfile);

module.exports = router;