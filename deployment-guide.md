# Demo deployment guide

## Current status

The repository contains production-style API and web images plus a same-origin Nginx reverse proxy. No external hosting provider, production PostgreSQL instance, DNS name, TLS certificate, or GitHub environment secrets are configured, so there is no live deployment to claim.

## Local demo artifact

```bash
cp .env.example .env
docker compose up --build
curl --fail http://localhost:8080/healthz
curl --fail http://localhost:8080/readyz
```

Open <http://localhost:5173>. `docker compose down` preserves data; `make demo-reset` intentionally deletes the local named volume and recreates deterministic seed data.

## Hosting topology

Deploy the web and API containers on one public HTTPS origin. Route `/api/` to the API and all other paths to Nginx with SPA fallback. PostgreSQL must be private and reachable only by the API.

Required runtime configuration:

- `DATABASE_URL` from a GitHub environment secret
- `APP_ORIGIN=https://your-demo-host.example` (exact, no wildcard)
- `COOKIE_SECURE=true`
- `APP_ENV=production`
- `HTTP_ADDR=:8080`

Do not put database, payment, session, or AI secrets in frontend build arguments.

## Safe release sequence

1. Run `.github/workflows/ci.yml` successfully.
2. Back up the target database and verify migration compatibility.
3. Apply the same files in `api/migrations` with `golang-migrate` from a one-off migration job.
4. Stop if migration fails; do not replace healthy application instances.
5. Deploy immutable API and web images using the same commit SHA tag.
6. Require successful `/healthz` and `/readyz` checks before shifting traffic.
7. If readiness fails, restore the prior image. Roll back schema only when the migration's down path has been rehearsed and data loss has been ruled out.
8. Run the demo smoke journey and inspect structured request logs without exposing cookies or passwords.

The current `deploy-demo.yml` ends after image builds. Add provider-specific migration, deployment, health, and rollback steps only when the target and secrets exist.
