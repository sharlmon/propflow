# Data model

```mermaid
erDiagram
  users ||--o{ sessions : owns
  users ||--o{ organization_members : joins
  organizations ||--o{ organization_members : has
  organizations ||--o{ properties : owns
  properties ||--o{ units : contains
  units ||--o| listings : publishes
  listings ||--o{ listing_images : shows
  listings ||--o{ inquiries : receives
  users ||--o{ inquiries : submits
  organizations ||--o{ tenancies : manages
  units ||--o{ tenancies : leased_as
  users ||--o{ tenancies : rents
  tenancies ||--o{ payments : records
  tenancies ||--o{ maintenance_requests : reports
  users ||--o{ audit_logs : acts
```

All primary keys are UUIDs. Money uses `numeric(12,2)` in PostgreSQL and is serialized as decimal-compatible JSON numbers. Ownership is derived through `organization_members`; mutation bodies do not accept authoritative organization or owner identifiers. Partial uniqueness prevents more than one active tenancy for a unit. Check constraints enforce all P0 enums and valid monetary/date ranges.
