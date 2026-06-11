const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Access token is missing or malformed.'
            });
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid or expired token.'
            });
        }

        // Fetch fresh user + role from DB
        const result = await pool.query(`
            SELECT u.user_id, u.full_name, u.email, u.is_active, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = $1
        `, [decoded.user_id]);

        if (result.rows.length === 0 || !result.rows[0].is_active) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not found or account is deactivated.'
            });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error('verifyToken error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Authentication check failed.'
        });
    }
};

module.exports = { verifyToken };
