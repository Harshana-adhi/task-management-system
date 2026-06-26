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

const findUserByIdWithPassword = async (userId) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE user_id = $1',
        [userId]
    );
    return result.rows[0];
};

const updatePassword = async (userId, passwordHash) => {
    const result = await pool.query(
        `UPDATE users 
         SET password_hash = $1, 
             must_change_password = FALSE,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2
         RETURNING user_id, full_name, email, role_id, must_change_password`,
        [passwordHash, userId]
    );
    return result.rows[0];
};

// Used by the forgot-password flow specifically — unlike updatePassword
// (a deliberate, user-initiated change, which clears the "must change"
// flag), this sets must_change_password back to TRUE, since the temporary
// password emailed to the user should be replaced with one only they
// know, the same way a freshly created account works.
const setTemporaryPassword = async (userId, passwordHash) => {
    const result = await pool.query(
        `UPDATE users 
         SET password_hash = $1, 
             must_change_password = TRUE,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2
         RETURNING user_id, full_name, email, role_id, must_change_password`,
        [passwordHash, userId]
    );
    return result.rows[0];
};

module.exports = { findUserByEmail, findUserById, findUserByIdWithPassword, updatePassword, setTemporaryPassword };