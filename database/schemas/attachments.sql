CREATE TABLE attachments (
    attachment_id UUID PRIMARY KEY,

    task_id UUID NOT NULL,

    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,

    uploaded_by UUID NOT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id)
    REFERENCES tasks(task_id),

    FOREIGN KEY (uploaded_by)
    REFERENCES users(user_id)
);