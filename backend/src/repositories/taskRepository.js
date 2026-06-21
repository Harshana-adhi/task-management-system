const pool = require('../config/database');

const createTask = async (projectId, title, description, priority, dueDate, createdBy) => {
    // Check unique title per project
    const existing = await pool.query(
        'SELECT * FROM tasks WHERE project_id = $1 AND title = $2',
        [projectId, title]
    );
    if (existing.rows.length > 0) {
        throw new Error('Task with this title already exists in this project');
    }

    const result = await pool.query(
        `INSERT INTO tasks (project_id, title, description, status, priority, due_date, created_by)
         VALUES ($1, $2, $3, 'To Do', $4, $5, $6)
         RETURNING *`,
        [projectId, title, description, priority, dueDate, createdBy]
    );
    return result.rows[0];
};

const getTaskById = async (taskId) => {
    const result = await pool.query(
        `SELECT t.*, p.created_by AS project_created_by
         FROM tasks t
         JOIN projects p ON t.project_id = p.project_id
         WHERE t.task_id = $1`,
        [taskId]
    );
    return result.rows[0];
};

const getAllTasks = async (projectId, userId, userRole) => {
    let query;
    let values = [projectId];

    if (userRole === 'Collaborator') {
        query = `
            SELECT t.* FROM tasks t
            JOIN task_assignments ta ON t.task_id = ta.task_id
            WHERE t.project_id = $1 AND ta.user_id = $2
            ORDER BY t.created_at DESC`;
        values = [projectId, userId];
    } else {
        query = `
            SELECT * FROM tasks
            WHERE project_id = $1
            ORDER BY created_at DESC`;
    }

    const result = await pool.query(query, values);
    return result.rows;
};

const getAssignedTasks = async (userId) => {
    const result = await pool.query(
        `SELECT t.* FROM tasks t
         JOIN task_assignments ta ON t.task_id = ta.task_id
         WHERE ta.user_id = $1
         ORDER BY t.created_at DESC`,
        [userId]
    );
    return result.rows;
};

const updateTask = async (taskId, fields) => {
    const allowedFields = ['title', 'description', 'status', 'priority', 'due_date'];
    const updates = [];
    const values = [];
    let index = 1;

    // Check unique title per project if title is being updated
    if (fields.title) {
        const task = await pool.query(
            'SELECT project_id FROM tasks WHERE task_id = $1',
            [taskId]
        );
        if (task.rows.length > 0) {
            const existing = await pool.query(
                `SELECT * FROM tasks 
                 WHERE project_id = $1 AND title = $2 AND task_id != $3`,
                [task.rows[0].project_id, fields.title, taskId]
            );
            if (existing.rows.length > 0) {
                throw new Error('Task with this title already exists in this project');
            }
        }
    }

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
    values.push(taskId);

    const result = await pool.query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE task_id = $${index} RETURNING *`,
        values
    );
    return result.rows[0];
};

const updateTaskStatus = async (taskId, status) => {
    const result = await pool.query(
        `UPDATE tasks SET status = $1, updated_at = NOW()
         WHERE task_id = $2 RETURNING *`,
        [status, taskId]
    );
    return result.rows[0];
};

const deleteTask = async (taskId) => {
    const result = await pool.query(
        `DELETE FROM tasks WHERE task_id = $1 RETURNING *`,
        [taskId]
    );
    return result.rows[0];
};

const getFilteredTasks = async (projectId, userId, userRole, status, priority) => {
    let query;
    const values = [projectId];
    let index = 2;

    if (userRole === 'Collaborator') {
        query = `
            SELECT t.* FROM tasks t
            JOIN task_assignments ta ON t.task_id = ta.task_id
            WHERE t.project_id = $1 AND ta.user_id = $${index}`;
        values.push(userId);
        index++;
    } else {
        query = `SELECT * FROM tasks WHERE project_id = $1`;
    }

    if (status) {
        query += ` AND ${userRole === 'Collaborator' ? 't.' : ''}status = $${index}`;
        values.push(status);
        index++;
    }

    if (priority) {
        query += ` AND ${userRole === 'Collaborator' ? 't.' : ''}priority = $${index}`;
        values.push(priority);
        index++;
    }

    query += ` ORDER BY ${userRole === 'Collaborator' ? 't.' : ''}created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
};

module.exports = {
    createTask,
    getTaskById,
    getAllTasks,
    getAssignedTasks,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getFilteredTasks
};