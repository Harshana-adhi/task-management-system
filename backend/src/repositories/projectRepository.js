const pool = require('../config/database');

const createProject = async (projectName, description, createdBy) => {
    const result = await pool.query(
        `INSERT INTO projects (project_name, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [projectName.trim(), description || null, createdBy]
    );
    return result.rows[0];
};

const getAllProjects = async () => {
    const result = await pool.query(
        `SELECT 
            p.project_id,
            p.project_name,
            p.description,
            p.created_at,
            p.updated_at,
            p.created_by,
            u.full_name AS created_by_name,
            u.email AS created_by_email,
            COUNT(DISTINCT pm.user_id) AS member_count
         FROM projects p
         LEFT JOIN users u ON p.created_by = u.user_id
         LEFT JOIN project_members pm ON p.project_id = pm.project_id
         GROUP BY p.project_id, u.full_name, u.email
         ORDER BY p.created_at DESC`
    );
    return result.rows;
};

const getProjectById = async (projectId) => {
    const result = await pool.query(
        `SELECT 
            p.*,
            u.full_name AS created_by_name,
            u.email AS created_by_email
         FROM projects p
         LEFT JOIN users u ON p.created_by = u.user_id
         WHERE p.project_id = $1`,
        [projectId]
    );
    return result.rows[0] || null;
};

const updateProject = async (projectId, projectName, description) => {
    const result = await pool.query(
        `UPDATE projects
         SET project_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
         WHERE project_id = $3
         RETURNING *`,
        [projectName.trim(), description || null, projectId]
    );
    return result.rows[0];
};

const addMember = async (projectId, userId) => {
    const userCheck = await pool.query(
        'SELECT user_id, full_name, email FROM users WHERE user_id = $1 AND is_active = TRUE',
        [userId]
    );
    if (userCheck.rows.length === 0) {
        throw new Error('User not found or inactive');
    }

    const memberCheck = await pool.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
    );
    if (memberCheck.rows.length > 0) {
        throw new Error('User is already a member of this project');
    }

    const result = await pool.query(
        `INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) RETURNING *`,
        [projectId, userId]
    );

    return {
        ...result.rows[0],
        full_name: userCheck.rows[0].full_name,
        email: userCheck.rows[0].email
    };
};

const removeMember = async (projectId, userId) => {
    const result = await pool.query(
        `DELETE FROM project_members
         WHERE project_id = $1 AND user_id = $2
         RETURNING *`,
        [projectId, userId]
    );
    return result.rows[0];
};

const getProjectMembers = async (projectId) => {
    const result = await pool.query(
        `SELECT 
            pm.project_member_id,
            pm.joined_at,
            u.user_id,
            u.full_name,
            u.email,
            r.role_name
         FROM project_members pm
         JOIN users u ON pm.user_id = u.user_id
         JOIN roles r ON u.role_id = r.role_id
         WHERE pm.project_id = $1
         ORDER BY pm.joined_at ASC`,
        [projectId]
    );
    return result.rows;
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    addMember,
    removeMember,
    getProjectMembers
};