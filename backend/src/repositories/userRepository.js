const pool = require('../config/database');

const createUser = async (fullName, email, passwordHash, roleId) => {
    const result = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role_id)
         VALUES ($1, $2, $3, $4)
         RETURNING user_id, full_name, email, role_id, is_active, must_change_password, created_at`,
        [fullName, email, passwordHash, roleId]
    );
    return result.rows[0];
};

const getAllUsers = async (search, roleId, isActive) => {
    let query = `
        SELECT u.user_id, u.full_name, u.email, u.role_id, 
               u.is_active, u.must_change_password, u.created_at,
               r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE 1=1
    `;
    const values = [];
    let index = 1;

    if (search) {
        query += ` AND (u.full_name ILIKE $${index} OR u.email ILIKE $${index})`;
        values.push(`%${search}%`);
        index++;
    }

    if (roleId) {
        query += ` AND u.role_id = $${index}`;
        values.push(roleId);
        index++;
    }

    if (isActive !== undefined) {
        query += ` AND u.is_active = $${index}`;
        values.push(isActive);
        index++;
    }

    query += ` ORDER BY u.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
};

const getUserById = async (userId) => {
    const result = await pool.query(
        `SELECT u.user_id, u.full_name, u.email, u.role_id,
                u.is_active, u.must_change_password, u.created_at,
                r.role_name
         FROM users u
         JOIN roles r ON u.role_id = r.role_id
         WHERE u.user_id = $1`,
        [userId]
    );
    return result.rows[0];
};

const getUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

const updateUser = async (userId, fields) => {
    const allowedFields = ['full_name', 'email', 'role_id'];
    const updates = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(fields)) {
        if (allowedFields.includes(key) && value !== undefined) {
            updates.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }
    }

    if (updates.length === 0) {
        throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${index} RETURNING user_id, full_name, email, role_id, is_active, updated_at`,
        values
    );
    return result.rows[0];
};

const deactivateUser = async (userId) => {
    const result = await pool.query(
        `UPDATE users SET is_active = FALSE, updated_at = NOW()
         WHERE user_id = $1
         RETURNING user_id, full_name, email, role_id, is_active`,
        [userId]
    );
    return result.rows[0];
};

const activateUser = async (userId) => {
    const result = await pool.query(
        `UPDATE users SET is_active = TRUE, updated_at = NOW()
         WHERE user_id = $1
         RETURNING user_id, full_name, email, role_id, is_active`,
        [userId]
    );
    return result.rows[0];
};

const getAllRoles = async () => {
    const result = await pool.query(`SELECT * FROM roles ORDER BY role_id`);
    return result.rows;
};

// roleName accepts either a single role string (existing behavior, e.g.
// 'Collaborator' when a PM is adding members) or an array of roles (e.g.
// ['Project Manager', 'Collaborator'] when an Admin is adding members —
// any active non-Admin user is a valid project member, but Admins
// themselves aren't, since Admin isn't a project-membership role).
const getUserLookup = async (search, roleName) => {
    let query = `
        SELECT u.user_id, u.full_name, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.is_active = TRUE
    `;
    const values = [];
    let index = 1;

    if (search) {
        query += ` AND (u.full_name ILIKE $${index} OR u.email ILIKE $${index})`;
        values.push(`%${search}%`);
        index++;
    }

    if (roleName) {
        const roleNames = Array.isArray(roleName) ? roleName : [roleName];
        query += ` AND r.role_name = ANY($${index}::text[])`;
        values.push(roleNames);
        index++;
    }

    query += ` ORDER BY u.full_name ASC`;

    const result = await pool.query(query, values);
    return result.rows;
};

// Used when notifying other Admins of account-wide events (e.g. a new
// project being created) — returns just the IDs, not full user rows,
// since that's all sendNotification needs per recipient.
const getActiveAdminIds = async () => {
    const result = await pool.query(
        `SELECT u.user_id FROM users u
         JOIN roles r ON u.role_id = r.role_id
         WHERE r.role_name = 'Admin' AND u.is_active = TRUE`
    );
    return result.rows.map((row) => row.user_id);
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deactivateUser,
    activateUser,
    getAllRoles,
    getUserLookup,
    getActiveAdminIds
};