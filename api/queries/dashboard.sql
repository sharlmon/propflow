-- name: LandlordUnitCounts :one
SELECT count(*)::int AS total_units,
       count(*) FILTER (WHERE u.availability_status = 'available')::int AS available_units,
       count(*) FILTER (WHERE u.availability_status = 'occupied')::int AS occupied_units
FROM units u JOIN properties p ON p.id = u.property_id WHERE p.organization_id = $1;
