# Verification evidence

Recorded on 23 August 2026 in the implementation workspace. A command is marked passed only when it exited successfully.

| Gate | Command/evidence | Result |
| --- | --- | --- |
| Frontend formatting | `npm run format:check` | Passed |
| Frontend lint | `npm run lint` | Passed |
| Frontend unit tests | `npm run test` | Passed: 2 files, 4 tests |
| Frontend production build | `npm run build` | Passed |
| OpenAPI contract | `npm run contract:check` | Passed, valid contract |
| Backend formatting | `gofmt` / clean diff check | Passed |
| Backend vet | `go vet ./...` | Passed |
| Backend tests | `go test ./...` | Passed |
| Backend race tests | `go test -race ./...` | Passed |
| Frontend dependencies | `npm audit --audit-level=high` | Passed: 0 vulnerabilities |
| Go reachable vulnerabilities | `govulncheck ./...` | Passed after fixed dependency upgrades: 0 reachable vulnerabilities |
| SQLC drift | pinned SQLC generation | Passed; generated package current |
| Workflow syntax | Ruby YAML parse of both workflow files | Passed |
| Empty PostgreSQL migration/seed | applied both migrations to isolated PostgreSQL | Passed; 3 users, 7 published listings, 1 active tenancy, 3 payments, 2 maintenance requests |
| Authentication smoke | health, login, current-user, logout against isolated PostgreSQL | Passed |
| Golden path | `npm run test:e2e` against isolated PostgreSQL | Passed in desktop Chromium (4.1s) |
| Mobile navigation | 360px Playwright route/navigation/overflow smoke | Passed in mobile Chromium (943ms) |
| Docker images | GitHub CI API and web image builds | Passed |
| Complete Compose topology | `docker compose up -d --build --wait`, API readiness and web probes | Passed on GitHub run `32603088075` |

## Explicitly unverified or external

- Docker commands were not executed locally because the Docker CLI was not installed (`docker: command not found`); the equivalent image and topology gates run on GitHub-hosted Docker.
- GitHub workflow `MVP quality gates` run `32603088075` passed all five jobs on commit `bd27be6`.
- No live deployment ran because no provider, production database, or environment secrets were supplied. The build-only deployment workflow states this boundary.
