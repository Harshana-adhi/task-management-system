const pool = require('../config/database');

const createProject = async (projectName, description, createdBy) => {
    // Check unique project name per creator
    const existing = await pool.query(
        'SELECT * FROM projects WHERE project_name = $1 AND created_by = $2',
        [projectName.trim(), createdBy]
    );
    if (existing.rows.length > 0) {
        throw new Error('You already have a project with this name');
    }

    const result = await pool.query(
        `INSERT INTO projects (project_name, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [projectName.trim(), description || null, createdBy]
    );
    return result.rows[0];
};

const getAllProjects = async (userId, userRole) => {
    let query;
    let values = [];

    if (userRole === 'Admin') {
        // Admin sees all projects
        query = `
            SELECT 
                p.project_id,
                p.project_name,
                p.description,
                p.is_archived,
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
            ORDER BY p.created_at DESC`;

    } else if (userRole === 'Project Manager') {
        // Project Manager sees only projects they created
        query = `
            SELECT 
                p.project_id,
                p.project_name,
                p.description,
                p.is_archived,
                p.created_at,
                p.updated_at,
                p.created_by,
                u.full_name AS created_by_name,
                u.email AS created_by_email,
                COUNT(DISTINCT pm.user_id) AS member_count
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.user_id
            LEFT JOIN project_members pm ON p.project_id = pm.project_id
            WHERE p.created_by = $1
            GROUP BY p.project_id, u.full_name, u.email
            ORDER BY p.created_at DESC`;
        values = [userId];

    } else {
        // Collaborator sees only projects they are members of
        query = `
            SELECT 
                p.project_id,
                p.project_name,
                p.description,
                p.is_archived,
                p.created_at,
                p.updated_at,
                p.created_by,
                u.full_name AS created_by_name,
                u.email AS created_by_email,
                COUNT(DISTINCT pm2.user_id) AS member_count
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.user_id
            JOIN project_members pm ON p.project_id = pm.project_id
            LEFT JOIN project_members pm2 ON p.project_id = pm2.project_id
            WHERE pm.user_id = $1
            GROUP BY p.project_id, u.full_name, u.email
            ORDER BY p.created_at DESC`;
        values = [userId];
    }

    const result = await pool.query(query, values);
    return result.rows;
};

const getProjectById = async (projectId, userId, userRole) => {
    let query;
    let values = [projectId];

    if (userRole === 'Admin') {
        // Admin can view any project
        query = `
            SELECT p.*, u.full_name AS created_by_name, u.email AS created_by_email
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.user_id
            WHERE p.project_id = $1`;

    } else if (userRole === 'Project Manager') {
        // Project Manager can only view projects they created
        query = `
            SELECT p.*, u.full_name AS created_by_name, u.email AS created_by_email
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.user_id
            WHERE p.project_id = $1 AND p.created_by = $2`;
        values = [projectId, userId];

    } else {
        // Collaborator can only view projects they are members of
        query = `
            SELECT p.*, u.full_name AS created_by_name, u.email AS created_by_email
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.user_id
            JOIN project_members pm ON p.project_id = pm.project_id
            WHERE p.project_id = $1 AND pm.user_id = $2`;
        values = [projectId, userId];
    }

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

const updateProject = async (projectId, projectName, description, createdBy) => {
    // Check unique project name per creator (exclude current project)
    const existing = await pool.query(
        `SELECT * FROM projects 
         WHERE project_name = $1 AND created_by = $2 AND project_id != $3`,
        [projectName.trim(), createdBy, projectId]
    );
    if (existing.rows.length > 0) {
        throw new Error('You already have a project with this name');
    }

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

const getProjectMembers = async (projectId, userId, userRole) => {
    // First check if user has access to this project
    const project = await getProjectById(projectId, userId, userRole);
    if (!project) return null;

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

const getProjectByIdInternal = async (projectId) => {
    const result = await pool.query(
        `SELECT p.*, u.full_name AS created_by_name, u.email AS created_by_email
         FROM projects p
         LEFT JOIN users u ON p.created_by = u.user_id
         WHERE p.project_id = $1`,
        [projectId]
    );
    return result.rows[0] || null;
};

const deleteProject = async (projectId) => {
    // ON DELETE CASCADE on tasks/project_members takes care of cleaning up
    // dependent rows (tasks, task_assignments, comments, attachments).
    const result = await pool.query(
        `DELETE FROM projects WHERE project_id = $1 RETURNING *`,
        [projectId]
    );
    return result.rows[0];
};

const setArchived = async (projectId, isArchived) => {
    const result = await pool.query(
        `UPDATE projects
         SET is_archived = $1, updated_at = CURRENT_TIMESTAMP
         WHERE project_id = $2
         RETURNING *`,
        [isArchived, projectId]
    );
    return result.rows[0];
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    getProjectByIdInternal,
    updateProject,
    addMember,
    removeMember,
    getProjectMembers,
    deleteProject,
    setArchived
};