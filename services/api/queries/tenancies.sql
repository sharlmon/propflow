-- name: TenanciesByOrganization :many
SELECT * FROM tenancies WHERE organization_id = $1 ORDER BY created_at DESC;

-- name: ActiveTenanciesByTenant :many
SELECT * FROM tenancies WHERE tenant_id = $1 AND status = 'active' ORDER BY start_date DESC;
