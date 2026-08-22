-- name: CreateSession :exec
INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3);

-- name: RevokeSession :exec
UPDATE sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL;
