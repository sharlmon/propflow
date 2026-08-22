# Development demo accounts

These accounts are created only by `api/migrations/000002_seed.up.sql`. They are public demo fixtures and must never be used as production credentials.

| Role | Email | Password |
| --- | --- | --- |
| Landlord | `landlord@propflow.demo` | `DemoPass2026!` |
| Renter | `renter@propflow.demo` | `DemoPass2026!` |
| Admin (reserved; no P0 portal) | `admin@propflow.demo` | `DemoPass2026!` |

The seeded landlord owns the `Amani Homes` organization. The seeded renter has one active tenancy, three ledger payments, public listing inquiries, and maintenance history.
