# Development demo accounts

These accounts are created only by `services/api/migrations/000002_seed.up.sql`. They are public demo fixtures and must never be used as production credentials.

| Role                           | Email                    | Password        |
| ------------------------------ | ------------------------ | --------------- |
| Landlord                       | `landlord@propflow.demo` | `DemoPass2026!` |
| Renter                         | `renter@propflow.demo`   | `DemoPass2026!` |
| Admin (reserved; no P0 portal) | `admin@propflow.demo`    | `DemoPass2026!` |

The seeded landlord owns the `Amani Homes` organization. The seeded renter has one active tenancy, three ledger payments, public listing inquiries, and maintenance history.

Host, guest, developer, project-manager, supervisor and contractor demo identities are intentionally not seeded on the ecosystem foundation branch. They are added with expanded RBAC and their first complete workflows so a visible account never implies unavailable permissions or fake data.
