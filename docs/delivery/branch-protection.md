# Branch protection

Configure GitHub rulesets after pushing `develop`:

## `develop`

- Require pull requests and one approval.
- Dismiss stale approvals after new commits.
- Require conversation resolution.
- Require branches to be up to date.
- Require `frontend`, `backend`, `database-and-contract`, `golden-path`, and `security-and-images` from **MVP quality gates**.
- Block force pushes and deletion.

## `main`

- Require pull requests from `develop` during the MVP.
- Require the same five checks and two approvals.
- Restrict direct pushes, force pushes, and deletion.
- Protect the `demo` environment with a reviewer before any provider deployment step is added.

No production deployment provider or credentials are configured in this repository. `deploy-demo.yml` intentionally stops after producing verified images until the owner selects a host and adds migration, health-check, and rollback credentials.
