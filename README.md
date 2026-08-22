# PropFlow + FindYourKeja

PropFlow is a landlord operations portal for Kenyan rental property. FindYourKeja is its connected public rental marketplace. This repository contains the Wednesday MVP: one React application, one Go API, and one PostgreSQL database supporting a complete landlord-to-renter journey.

## MVP journey

A landlord can sign in, create a property and unit, publish it, manage a renter inquiry, create a tenancy, record a demo ledger payment, and update maintenance. A renter can search public listings, inquire, see tenancy/payment state, and submit maintenance. Dashboards derive their values from PostgreSQL.

Live payments, AI, uploads, e-signatures, chat, admin moderation, and advanced accounting are deliberately excluded from the P0 navigation.

## Architecture

This is a modular monolith with two deployable containers behind one browser origin:

```text
Browser → Nginx/Vite → /api/v1 → Go/Chi API → PostgreSQL 17
```

- `web/`: React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind, Vitest/Testing Library, Playwright
- `api/`: Go 1.25, `net/http`, Chi, pgx/pgxpool, SQLC query definitions and generated package, `slog`
- `api/migrations/`: additive schema and deterministic Kenyan demo seed
- `docs/api/openapi.yaml`: OpenAPI 3 contract
- `compose.yaml`: PostgreSQL, API, and production-like Nginx web container

Architectural rationale and diagrams are in [docs/architecture](docs/architecture).

## Prerequisites

The simplest path requires Docker with Compose. For split local development, install Node.js 20.19+ with npm 10, Go 1.25+, PostgreSQL 17, `psql`, and optionally `golang-migrate` and SQLC.

## Quick start with Docker

```bash
cp .env.example .env
docker compose up --build
```

Open <http://localhost:5173>. PostgreSQL initializes the schema and seed only when its volume is empty. Stop the stack with `docker compose down`; use `make demo-reset` only when you intentionally want to delete the local demo volume and reseed it.

## Split local development

Start PostgreSQL first:

```bash
docker compose up -d db
cp web/.env.example web/.env.local
cd api
DATABASE_URL='postgres://propflow:propflow_dev_only@localhost:5432/propflow?sslmode=disable' \
  APP_ORIGIN='http://localhost:5173' go run ./cmd/api
```

In a second terminal:

```bash
cd web
npm ci
npm run dev
```

Vite proxies `/api` to port 8080, so cookies remain same-origin from the browser's perspective.

## Configuration

Copy [`.env.example`](.env.example) for Compose and [`web/.env.example`](web/.env.example) for Vite. Important settings are:

- `DATABASE_URL`: PostgreSQL DSN; required by the API
- `APP_ORIGIN`: the one exact browser origin allowed for credentialed requests
- `COOKIE_SECURE`: set `true` behind production HTTPS
- `SESSION_TTL`: server-side session lifetime
- `VITE_API_BASE_URL`: normally `/api/v1`

No AI provider secret or payment credential belongs in a `VITE_*` variable.

## Database and demo data

Migrations are [api/migrations/000001_initial.up.sql](api/migrations/000001_initial.up.sql) and [api/migrations/000002_seed.up.sql](api/migrations/000002_seed.up.sql). With `golang-migrate` installed:

```bash
make migrate-up
make migrate-down
make seed
make db-reset
```

The reset, seed, and down targets reject database URLs that do not look like the local `propflow` demo database. The test target separately requires `TEST_DATABASE_URL` containing `_test` or `test_`.

Seeded accounts all use the development-only password `DemoPass2026!`:

| Role | Email |
| --- | --- |
| Landlord | `landlord@propflow.demo` |
| Renter | `renter@propflow.demo` |
| Future admin seed | `admin@propflow.demo` |

See [docs/demo/accounts.md](docs/demo/accounts.md) for the warning and seeded state.

## Verification

```bash
cd web
npm run format:check
npm run lint
npm run test
npm run build
npm run contract:check
npm audit --audit-level=high

cd ../api
gofmt -l .
go vet ./...
go test ./...
go test -race ./...
govulncheck ./...
```

The isolated browser journey requires a PostgreSQL database whose name clearly contains `test`:

```bash
docker compose --profile test up -d test-db
psql 'postgres://propflow:propflow_test_only@localhost:5433/propflow_test?sslmode=disable' \
  -v ON_ERROR_STOP=1 -f api/migrations/000001_initial.up.sql
psql 'postgres://propflow:propflow_test_only@localhost:5433/propflow_test?sslmode=disable' \
  -v ON_ERROR_STOP=1 -f api/migrations/000002_seed.up.sql
TEST_DATABASE_URL='postgres://propflow:propflow_test_only@localhost:5433/propflow_test?sslmode=disable' \
  make test-e2e
```

Local evidence and explicit blockers are recorded in [docs/delivery/verification.md](docs/delivery/verification.md). CI repeats frontend, backend, migration, contract, E2E, dependency, secret, and image-build gates.

## API and routes

The API contract is [docs/api/openapi.yaml](docs/api/openapi.yaml). Health probes are `GET /healthz` and `GET /readyz`; product endpoints are under `/api/v1`.

Public routes: `/`, `/listings`, `/listings/:slug`, `/login`, `/register`.

Landlord routes: `/landlord/dashboard`, `/landlord/properties`, `/landlord/properties/new`, `/landlord/properties/:propertyId`, `/landlord/inquiries`, `/landlord/tenancies`, `/landlord/payments`, `/landlord/maintenance`, `/landlord/profile`.

Renter routes: `/renter/dashboard`, `/renter/inquiries`, `/renter/maintenance`, `/renter/profile`.

## Delivery workflow

Work is merged feature-by-feature into `develop`; `main` remains the preserved prototype baseline until the complete release gate is independently approved. See the [branch plan](docs/delivery/branch-plan.md), [workboard](docs/delivery/workboard.md), and [branch protection guide](docs/delivery/branch-protection.md).

`.github/workflows/ci.yml` runs on pull requests and pushes to `develop`/`main`. `.github/workflows/deploy-demo.yml` currently builds release images on `main`; it intentionally does not claim a live deployment because no hosting provider, production database, or environment secrets are configured.

## Demo

Follow the repeatable [5–7 minute demo script](docs/demo/demo-script.md). The Docker fallback needs no source edits.

## Known limitations

- The payment feature is a ledger only; `mpesa_demo` is simulated.
- No hosting target is configured, and Docker image/Compose execution could not be locally verified in the authoring environment because the Docker CLI was unavailable.
- SQLC query files and generated code are checked for drift, while current domain handlers still use centralized parameterized pgx statements; moving handler persistence behind domain repositories is the next backend refactor.
- The retained legacy prototype components remain as visual reference but are not routed or imported into the production application.
- Frontend unit coverage is deliberately narrow; the real PostgreSQL golden-path Playwright test carries the principal integration confidence.

## Post-MVP roadmap

After the demo gate: extract SQLC-backed repositories, expand component/API integration tests, configure a hosting provider and migration/health rollback, then consider document storage, notifications, verified payment-provider adapters, moderation, and backend-mediated AI. Deferred features must remain hidden until they have real behavior and security review.
