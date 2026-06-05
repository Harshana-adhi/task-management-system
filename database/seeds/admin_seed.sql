INSERT INTO users (
    user_id,
    full_name,
    email,
    password_hash,
    role_id
)
VALUES (
    gen_random_uuid(),
    'System Admin',
    'admin@task.com',
    '$2b$10$hashedpasswordhere',
    1
);