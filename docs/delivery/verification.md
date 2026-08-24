# Verification evidence

## Ecosystem foundation — 24 August 2026

The table below is updated only after each command completes. Docker/Compose remains dependent on local Docker availability; the prior `develop` CI result is retained separately below and is not reused as evidence for this branch.

| Gate                       | Command/evidence                                            | Result                                                                                       |
| -------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Workspace install          | `npm install`                                               | Passed; root workspace lockfile created                                                      |
| Frontend dependency audit  | `npm audit --audit-level=high`                              | Passed: 0 vulnerabilities                                                                    |
| Workspace quality          | `npm run format:check`, `npm run lint`, `npm run typecheck` | Passed for platform-web and JengaBora-web                                                    |
| Frontend unit tests        | `npm run test`                                              | Passed: platform 2 files/5 tests; JengaBora 1 file/1 test                                    |
| Production builds          | `npm run build`                                             | Passed for both Vite applications                                                            |
| Go formatting/vet/tests    | `gofmt -l .`, `go vet ./...`, `go test -count=1 ./...`      | Passed after API module relocation                                                           |
| Go race tests              | `go test -race -count=1 ./...`                              | Passed                                                                                       |
| OpenAPI contract           | `npm run contract:check --workspace @propflow/platform-web` | Passed; ecosystem health and domain contract are valid                                       |
| SQLC generation            | pinned SQLC 1.30 generation in `services/api`               | Passed; generated bindings have no drift                                                     |
| Workflow/Compose syntax    | Ruby YAML parse                                             | Passed for CI, deployment workflow and Compose                                               |
| Empty PostgreSQL migration | migrations 001–003 on isolated PostgreSQL                   | Passed                                                                                       |
| Migration invariants       | `migrations/test/000003_foundation_assertions.sql`          | Passed: immutable events, booking overlap, approval gate and score cold-start                |
| Migration rollback/reapply | migration 003 down, baseline check, migration 003 up        | Passed; seven baseline listings survived and ecosystem tables were removed/recreated cleanly |
| Local ecosystem runtime    | HTTP probes on 3000/3001/8080                               | Passed; canonical deep links returned 200 and ecosystem health returned all five products    |
| Demo authentication        | landlord login from allowed `http://127.0.0.1:3000` origin  | Passed; server returned an HttpOnly session cookie and landlord identity                     |

Docker image and full Compose execution remain delegated to CI because the Docker CLI is unavailable locally. The local foundation services were left running on `127.0.0.1:3000`, `127.0.0.1:3001` and `127.0.0.1:8080` after verification.

---

## Verified `develop` baseline — 23 August 2026

Recorded on 23 August 2026 in the implementation workspace. A command is marked passed only when it exited successfully.

| Gate                            | Command/evidence                                                    | Result                                                                                      |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Frontend formatting             | `npm run format:check`                                              | Passed                                                                                      |
| Frontend lint                   | `npm run lint`                                                      | Passed                                                                                      |
| Frontend unit tests             | `npm run test`                                                      | Passed: 2 files, 4 tests                                                                    |
| Frontend production build       | `npm run build`                                                     | Passed                                                                                      |
| OpenAPI contract                | `npm run contract:check`                                            | Passed, valid contract                                                                      |
| Backend formatting              | `gofmt` / clean diff check                                          | Passed                                                                                      |
| Backend vet                     | `go vet ./...`                                                      | Passed                                                                                      |
| Backend tests                   | `go test ./...`                                                     | Passed                                                                                      |
| Backend race tests              | `go test -race ./...`                                               | Passed                                                                                      |
| Frontend dependencies           | `npm audit --audit-level=high`                                      | Passed: 0 vulnerabilities                                                                   |
| Go reachable vulnerabilities    | `govulncheck ./...`                                                 | Passed after fixed dependency upgrades: 0 reachable vulnerabilities                         |
| SQLC drift                      | pinned SQLC generation                                              | Passed; generated package current                                                           |
| Workflow syntax                 | Ruby YAML parse of both workflow files                              | Passed                                                                                      |
| Empty PostgreSQL migration/seed | applied both migrations to isolated PostgreSQL                      | Passed; 3 users, 7 published listings, 1 active tenancy, 3 payments, 2 maintenance requests |
| Authentication smoke            | health, login, current-user, logout against isolated PostgreSQL     | Passed                                                                                      |
| Golden path                     | `npm run test:e2e` against isolated PostgreSQL                      | Passed in desktop Chromium (4.1s)                                                           |
| Mobile navigation               | 360px Playwright route/navigation/overflow smoke                    | Passed in mobile Chromium (943ms)                                                           |
| Docker images                   | GitHub CI API and web image builds                                  | Passed                                                                                      |
| Complete Compose topology       | `docker compose up -d --build --wait`, API readiness and web probes | Passed on GitHub run `32603088075`                                                          |

## Explicitly unverified or external

- Docker commands were not executed locally because the Docker CLI was not installed (`docker: command not found`); the equivalent image and topology gates run on GitHub-hosted Docker.
- GitHub workflow `MVP quality gates` run `32603088075` passed all five jobs on commit `bd27be6`.
- No live deployment ran because no provider, production database, or environment secrets were supplied. The build-only deployment workflow states this boundary.
