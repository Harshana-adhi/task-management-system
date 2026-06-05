CREATE TABLE tasks (
    task_id UUID PRIMARY KEY,

    project_id UUID NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,

    status VARCHAR(30) NOT NULL,
    priority VARCHAR(30) NOT NULL,

    due_date TIMESTAMP,

    created_by UUID NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id)
    REFERENCES projects(project_id),

    FOREIGN KEY (created_by)
    REFERENCES users(user_id)
);