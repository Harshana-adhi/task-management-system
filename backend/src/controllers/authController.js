const { loginUser, changePassword, getUserById } = require('../services/authService');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Email and password are required'
            });
        }

        const result = await loginUser(email, password);

        return res.status(200).json({
            message: 'Login successful',
            token: result.token,
            mustChangePassword: result.mustChangePassword,
            user: result.user
        });

    } catch (error) {
        const isAuthFailure = error.message === 'Invalid email or password';
        const isConfigError = error.message === 'AUTH_CONFIG_ERROR';
        const isDeactivated = error.message === 'ACCOUNT_DEACTIVATED';

        if (isConfigError) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authentication service is not configured'
            });
        }

        if (isDeactivated) {
            return res.status(403).json({
                error: 'Account Deactivated',
                message: 'This account has been deactivated. Please contact an administrator.'
            });
        }

        return res.status(isAuthFailure ? 401 : 500).json({
            error: isAuthFailure ? 'Unauthorized' : 'Internal Server Error',
            message: isAuthFailure ? 'Invalid email or password' : 'An unexpected error occurred'
        });
    }
};

const changeUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.user_id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Current password and new password are required'
            });
        }

        const updatedUser = await changePassword(userId, currentPassword, newPassword);

        return res.status(200).json({
            message: 'Password changed successfully',
            user: updatedUser
        });

    } catch (error) {
        const isValidationError = [
            'Current password is incorrect',
            'New password must be at least 8 characters',
            'New password must be different from current password'
        ].includes(error.message);

        return res.status(isValidationError ? 400 : 500).json({
            error: isValidationError ? 'Bad Request' : 'Internal Server Error',
            message: isValidationError ? error.message : 'An unexpected error occurred'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        const { password_hash, ...safeUser } = user;

        return res.status(200).json({
            user: safeUser
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
};

module.exports = { login, changeUserPassword, getProfile };