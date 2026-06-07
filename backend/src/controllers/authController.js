const { loginUser } = require('../services/authService');

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

        if (isConfigError) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authentication service is not configured'
            });
        }

        return res.status(isAuthFailure ? 401 : 500).json({
            error: isAuthFailure ? 'Unauthorized' : 'Internal Server Error',
            message: isAuthFailure ? 'Invalid email or password' : 'An unexpected error occurred'
        });
    }
};

module.exports = { login };