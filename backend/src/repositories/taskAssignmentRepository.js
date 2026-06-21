const pool = require('../config/database');

const assignTask = async (
  taskId,
  userId
) => {

  const existing =
    await pool.query(
      `
      SELECT *
      FROM task_assignments
      WHERE task_id = $1
      `,
      [taskId]
    );

  if (existing.rows.length > 0) {

    const updated =
      await pool.query(
        `
        UPDATE task_assignments
        SET
          user_id = $1,
          assigned_at = NOW()
        WHERE task_id = $2
        RETURNING *
        `,
        [userId, taskId]
      );

    return updated.rows[0];
  }

  const inserted =
    await pool.query(
      `
      INSERT INTO task_assignments
      (
        task_id,
        user_id
      )
      VALUES ($1,$2)
      RETURNING *
      `,
      [taskId, userId]
    );

  return inserted.rows[0];
};

module.exports = {
  assignTask
};