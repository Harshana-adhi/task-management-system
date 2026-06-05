CREATE TABLE task_assignments (
    assignment_id SERIAL PRIMARY KEY,

    task_id UUID NOT NULL,
    user_id UUID NOT NULL,

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(task_id,user_id),

    FOREIGN KEY (task_id)
    REFERENCES tasks(task_id),

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);