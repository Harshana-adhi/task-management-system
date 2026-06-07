const jwt = require('jsonwebtoken');
const { getUserById } = require('../services/authService');

const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role_name)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };