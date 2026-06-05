CREATE TABLE project_members (
    project_member_id SERIAL PRIMARY KEY,

    project_id UUID NOT NULL,
    user_id UUID NOT NULL,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(project_id,user_id),

    FOREIGN KEY (project_id)
    REFERENCES projects(project_id),

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);