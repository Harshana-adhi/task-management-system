// src/repositories/taskRepository.js

const pool = require('../config/database');

const createTask = async (
  projectId,
  title,
  description,
  priority,
  dueDate,
  createdBy
) => {

  const query = `
    INSERT INTO tasks
    (
      project_id,
      title,
      description,
      status,
      priority,
      due_date,
      created_by
    )
    VALUES
    ($1,$2,$3,'To Do',$4,$5,$6)
    RETURNING *
  `;

  const values = [
    projectId,
    title,
    description,
    priority,
    dueDate,
    createdBy
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllTasks = async () => {

  const result = await pool.query(`
    SELECT
      t.*,
      u.full_name AS assigned_user

    FROM tasks t

    LEFT JOIN task_assignments ta
      ON t.task_id = ta.task_id

    LEFT JOIN users u
      ON ta.user_id = u.user_id

    ORDER BY t.created_at DESC
  `);

  return result.rows;
};

const updateTask = async (
  taskId,
  title,
  description,
  status,
  priority,
  dueDate
) => {

  const result = await pool.query(
    `
    UPDATE tasks
    SET
      title = $1,
      description = $2,
      status = $3,
      priority = $4,
      due_date = $5,
      updated_at = NOW()
    WHERE task_id = $6
    RETURNING *
    `,
    [
      title,
      description,
      status,
      priority,
      dueDate,
      taskId
    ]
  );

  return result.rows[0];
};

const deleteTask = async (taskId) => {

    const result = await pool.query(
        `
        DELETE FROM tasks
        WHERE task_id = $1
        RETURNING *
        `,
        [taskId]
    );

    return result.rows[0];
};

//filter and sorting
const getFilteredTasks = async (status, priority) => {

let query = `
  SELECT
    t.*,
    u.full_name AS assigned_user,
    ta.user_id AS assigned_user_id

  FROM tasks t

  LEFT JOIN task_assignments ta
    ON t.task_id = ta.task_id

  LEFT JOIN users u
    ON ta.user_id = u.user_id

  WHERE 1=1
`;

    const values = [];
    let index = 1;

    if (status) {
        query += ` AND status = $${index}`;
        values.push(status);
        index++;
    }

    if (priority) {
        query += ` AND priority = $${index}`;
        values.push(priority);
        index++;
    }

    query += `
    ORDER BY t.created_at DESC
`;

    const result = await pool.query(query, values);

    return result.rows;
};

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getFilteredTasks
}; 