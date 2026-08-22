-- name: MaintenanceByOrganization :many
SELECT * FROM maintenance_requests WHERE organization_id = $1 ORDER BY created_at DESC;

-- name: MaintenanceByCreator :many
SELECT * FROM maintenance_requests WHERE created_by = $1 ORDER BY created_at DESC;
