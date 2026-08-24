-- name: InquiriesByRenter :many
SELECT * FROM inquiries WHERE renter_id = $1 ORDER BY created_at DESC;

-- name: CreateInquiry :one
INSERT INTO inquiries (listing_id, renter_id, message) VALUES ($1, $2, $3) RETURNING *;
