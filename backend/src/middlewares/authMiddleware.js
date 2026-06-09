const jwt = require('jsonwebtoken');
const { getUserById } = require('../services/authService');

const authenticate = async (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authentication service is not configured'
            });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found'
            });
        }

        const { password_hash, ...safeUser } = user;
        req.user = safeUser;   // Attach user info to request object for downstream use
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
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }

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