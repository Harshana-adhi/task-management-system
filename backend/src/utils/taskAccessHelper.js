const pool = require('../config/database');

const checkTaskAccess = async (taskId, userId, userRole) => {
    if (userRole === 'Admin') return true;

    if (userRole === 'Project Manager') {
        const result = await pool.query(
            `SELECT t.task_id FROM tasks t
             JOIN projects p ON t.project_id = p.project_id
             WHERE t.task_id = $1 AND p.created_by = $2`,
            [taskId, userId]
        );
        return result.rows.length > 0;
    }

    // Collaborator — must be assigned to task
    const result = await pool.query(
        `SELECT * FROM task_assignments
         WHERE task_id = $1 AND user_id = $2`,
        [taskId, userId]
    );
    return result.rows.length > 0;
};

module.exports = { checkTaskAccess };