CREATE TABLE projects (
    project_id UUID PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
    REFERENCES users(user_id)
);