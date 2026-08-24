# PropFlow Ecosystem

PropFlow is the shared property-operations core for a connected Kenyan real-estate ecosystem:

- **PropFlow** — landlord and property-manager operations.
- **FindYourKeja** — verified long-term rentals sourced from PropFlow inventory.
- **StayBora** — short-stay listings, calendars, bookings and host accounting.
- **JengaBora** — construction milestones, proof of work, approvals and payment-release control.

The verified `develop` baseline already completes the long-term landlord-to-renter MVP. The current ecosystem work preserves that path while adding a workspace foundation for the other products. Foundation routes are labeled honestly; they are not presented as completed payment, booking or construction workflows.

## Runtime topology

```text
Platform browser :3000 ─┐
                        ├─ /api/v1 ─> Go/Chi API :8080 ─> PostgreSQL :5432
JengaBora browser :3001 ┘                         └──────> MinIO :9000
```

- `apps/platform-web/`: React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod and Tailwind.
- `apps/jengabora-web/`: separate React/Vite application shell for construction workflows.
- `services/api/`: Go 1.25 modular monolith with Chi, pgx/pgxpool, SQLC, `slog` and server-side sessions.
- `packages/ui/`: shared accessible presentation primitives.
- `packages/api-client/`: credentialed typed API client foundation.
- `packages/contracts/`: shared API envelope and identity contracts.
- `packages/config/`: ecosystem product metadata, feature flags and design tokens.
- `services/api/migrations/`: additive PostgreSQL schema and deterministic Kenyan demo seed.
- `docs/api/openapi.yaml`: implemented API contract; future domains are not documented as live endpoints.
- `compose.yaml`: PostgreSQL, MinIO, API and both production-like Nginx frontends.

## Local development

Prerequisites: Node.js 20.19+, npm 10, Go 1.25+ and PostgreSQL 17. Docker Compose is the simplest full topology when Docker is available.

Install the npm workspace once:

```bash
npm ci
```

Run the services in separate terminals:

```bash
make api
make platform-web
make jengabora-web
```

Open:

- Platform ecosystem: <http://localhost:3000>
- JengaBora: <http://localhost:3001>
- API health: <http://localhost:8080/healthz>

For the complete container topology:

```bash
cp .env.example .env
docker compose up --build
```

MinIO's S3 endpoint is <http://localhost:9000>; its local administration console is on port 9001. Development credentials in `.env.example` are demo-only.

## Implemented platform routes

Public and marketplace:

```text
/
/login
/register
/keja
/keja/listings
/keja/listings/:slug
/stay/*                  foundation routes; workflows deferred
```

PropFlow landlord operations:

```text
/propflow/dashboard
/propflow/properties
/propflow/properties/new
/propflow/properties/:propertyId
/propflow/inquiries
/propflow/tenancies
/propflow/payments
/propflow/maintenance
```

Legacy `/landlord/*`, `/renter/*` and `/listings/*` routes remain temporarily available so the verified MVP and existing bookmarks do not break during migration.

JengaBora route foundations run in the separate application on port 3001. Their database-backed behavior begins on `feat/jengabora-projects-milestones`; no approval or payout control is currently claimed as complete.

## Demo accounts

The current long-term rental seed uses the development-only password `DemoPass2026!`:

| Role              | Email                    |
| ----------------- | ------------------------ |
| Landlord          | `landlord@propflow.demo` |
| Renter            | `renter@propflow.demo`   |
| Future admin seed | `admin@propflow.demo`    |

See `docs/demo/accounts.md`. New host, guest, developer, supervisor and contractor accounts are added only when shared RBAC and their workflows are implemented.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build

cd services/api
gofmt -l .
go vet ./...
go test ./...
go test -race ./...
```

Database migrations are applied in order:

```text
000001_initial.up.sql
000002_seed.up.sql
000003_ecosystem_foundation.up.sql
```

The third migration adds schema foundations and guardrails for reconciliation, media, short stays, construction approvals, release accounting and explainable tenant-score evidence. It does not imply those HTTP workflows are implemented.

## Security boundary

- Browser sessions use cryptographically random server-side tokens in `HttpOnly` cookies.
- Passwords use Argon2id.
- Mutations enforce an exact configured origin allow-list; both local applications are supported.
- Ownership and role checks remain server-side.
- Provider secrets never use `VITE_*` variables.
- MinIO is private by default; media authorization and upload endpoints are implemented in the proof-of-work feature branch.
- Live M-Pesa collection, host payouts and contractor disbursements are not claimed as production-ready.
- Tenant scoring cannot make an approval, rejection or eviction decision.

## Delivery sequence

The branch plan and workboard live in `docs/delivery/branch-plan.md` and `docs/delivery/workboard.md`. The current branch is `chore/ecosystem-foundation`; the exact next branch is `feat/shared-auth-rbac` after all foundation checks pass.

Confidential & Proprietary — Patent protection intended. Unauthorised commercial use may result in legal action.
