-- name: PropertiesByOrganization :many
SELECT id, organization_id, name, description, address_line, locality, county, status, created_at, updated_at
FROM properties WHERE organization_id = $1 ORDER BY created_at DESC;

-- name: CreateProperty :one
INSERT INTO properties (organization_id, name, description, address_line, locality, county, status)
VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
