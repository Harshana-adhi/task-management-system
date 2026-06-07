const pool = require('../config/database');

const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0];
};

const findUserById = async (userId) => {
    const result = await pool.query(
        `SELECT u.*, r.role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.role_id 
         WHERE u.user_id = $1`,
        [userId]
    );
    return result.rows[0];
};

module.exports = { findUserByEmail, findUserById };