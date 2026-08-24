-- name: PublishedListingBySlug :one
SELECT * FROM listings WHERE slug = $1 AND status = 'published';

-- name: PublishListing :execrows
UPDATE listings SET status = 'published', published_at = COALESCE(published_at, now()), updated_at = now()
WHERE id = $1 AND status IN ('draft', 'unpublished');
