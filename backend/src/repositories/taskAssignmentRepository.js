const pool = require('../config/database');

const assignTask = async (taskId, userId) => {

    const result = await pool.query(
        `
        INSERT INTO task_assignments
        (
            task_id,
            user_id
        )
        VALUES
        ($1,$2)
        RETURNING *
        `,
        [taskId, userId]
    );

    return result.rows[0];
};

module.exports = {
    assignTask
};