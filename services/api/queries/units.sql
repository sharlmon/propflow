-- name: UnitsByProperty :many
SELECT * FROM units WHERE property_id = $1 ORDER BY unit_label;

-- name: CreateUnit :one
INSERT INTO units (property_id, unit_label, bedrooms, bathrooms, rent_amount, deposit_amount, availability_status)
VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
