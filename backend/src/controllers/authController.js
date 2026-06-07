const { loginUser } = require('../services/authService');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
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
        return res.status(401).json({
            error: 'Unauthorized',
            message: error.message
        });
    }
};

module.exports = { login };