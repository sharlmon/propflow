-- name: PaymentsByTenancy :many
SELECT * FROM payments WHERE tenancy_id = $1 ORDER BY paid_at DESC;

-- name: CreatePayment :one
INSERT INTO payments (tenancy_id, amount, method, reference, status, paid_at, recorded_by)
VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
