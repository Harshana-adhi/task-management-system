CREATE TABLE comments (
    comment_id UUID PRIMARY KEY,

    task_id UUID NOT NULL,
    user_id UUID NOT NULL,

    comment_text TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id)
    REFERENCES tasks(task_id),

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);