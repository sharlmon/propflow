# Demo deployment guide

## Current status

The repository contains production-style API, platform-web and JengaBora-web images plus same-origin Nginx reverse proxies. PostgreSQL and MinIO remain private infrastructure. No external hosting provider, production database/object store, DNS name, TLS certificate, or GitHub environment secrets are configured, so there is no live deployment to claim.

## Local demo artifact

```bash
cp .env.example .env
docker compose up --build
curl --fail http://localhost:8080/healthz
curl --fail http://localhost:8080/readyz
curl --fail http://localhost:9000/minio/health/live
```

Open the platform at <http://localhost:3000> and JengaBora at <http://localhost:3001>. `docker compose down` preserves data and media; `make demo-reset` intentionally deletes both local named volumes and recreates deterministic seed data.

## Hosting topology

Deploy each web application on its own public HTTPS origin. Route each origin's `/api/` traffic to the shared API and all other paths to its Nginx SPA fallback. PostgreSQL and the S3-compatible object store must be private and reachable only by the API.

Required runtime configuration:

- `DATABASE_URL` from a GitHub environment secret
- `APP_ORIGINS=https://platform.example,https://jengabora.example` (exact allow-list, no wildcard)
- `COOKIE_SECURE=true`
- `APP_ENV=production`
- `HTTP_ADDR=:8080`
- private S3 endpoint, bucket and access credentials

Do not put database, payment, session, or AI secrets in frontend build arguments.

## Safe release sequence

1. Run `.github/workflows/ci.yml` successfully.
2. Back up the target database and verify migration compatibility.
3. Apply the same files in `services/api/migrations` with `golang-migrate` from a one-off migration job.
4. Stop if migration fails; do not replace healthy application instances.
5. Deploy immutable API and both web images using the same commit SHA tag.
6. Require successful `/healthz` and `/readyz` checks before shifting traffic.
7. If readiness fails, restore the prior image. Roll back schema only when the migration's down path has been rehearsed and data loss has been ruled out.
8. Run the demo smoke journey and inspect structured request logs without exposing cookies or passwords.

The current `deploy-demo.yml` ends after image builds. Add provider-specific migration, deployment, health, and rollback steps only when the target and secrets exist.
