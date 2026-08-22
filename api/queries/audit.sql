-- name: CreateAuditLog :exec
INSERT INTO audit_logs (actor_user_id, organization_id, action, resource_type, resource_id, metadata, ip_address, user_agent, request_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
