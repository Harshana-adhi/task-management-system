const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

// Create a new project
const createProject = async ({ projectName, description, createdBy }) => {
    const projectId = uuidv4();

    const query = `
        INSERT INTO projects (project_id, project_name, description, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [projectId, projectName.trim(), description || null, createdBy];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get all projects with creator info
const getAllProjects = async () => {
    const query = `
        SELECT 
            p.project_id,
            p.project_name,
            p.description,
            p.created_at,
            p.updated_at,
            u.full_name AS created_by_name,
            u.email AS created_by_email,
            COUNT(DISTINCT pm.user_id) AS member_count
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.user_id
        LEFT JOIN project_members pm ON p.project_id = pm.project_id
        GROUP BY p.project_id, u.full_name, u.email
        ORDER BY p.created_at DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
};

// Get a single project by ID
const getProjectById = async (projectId) => {
    const query = `
        SELECT 
            p.*,
            u.full_name AS created_by_name,
            u.email AS created_by_email
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.user_id
        WHERE p.project_id = $1;
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows[0] || null;
};

// Update project
const updateProject = async (projectId, { projectName, description }) => {
    const query = `
        UPDATE projects
        SET 
            project_name = $1,
            description = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $3
        RETURNING *;
    `;
    const values = [projectName.trim(), description || null, projectId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Add a member to a project
const addMember = async (projectId, userId) => {
    // Check user exists
    const userCheck = await pool.query('SELECT user_id, full_name, email FROM users WHERE user_id = $1 AND is_active = TRUE', [userId]);
    if (userCheck.rows.length === 0) {
        throw new Error('User not found or inactive.');
    }

    // Check already a member
    const memberCheck = await pool.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
    );
    if (memberCheck.rows.length > 0) {
        throw new Error('User is already a member of this project.');
    }

    const query = `
        INSERT INTO project_members (project_id, user_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const result = await pool.query(query, [projectId, userId]);

    return {
        ...result.rows[0],
        full_name: userCheck.rows[0].full_name,
        email: userCheck.rows[0].email
    };
};

// Get all members of a project
const getProjectMembers = async (projectId) => {
    const query = `
        SELECT 
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
        ORDER BY pm.joined_at ASC;
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows;
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    addMember,
    getProjectMembers
};
