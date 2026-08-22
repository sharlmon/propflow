-- name: UserByEmail :one
SELECT id, email, password_hash, full_name, phone, role, status, created_at, updated_at
FROM users WHERE email = $1;

-- name: CreateUser :one
INSERT INTO users (email, password_hash, full_name, phone, role)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, email, full_name, phone, role, status, created_at, updated_at;
