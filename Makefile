.PHONY: dev api web test test-web test-api test-e2e migrate-up migrate-down seed db-reset demo demo-reset sqlc check-dev-db

DATABASE_URL ?= postgres://propflow:propflow_dev_only@localhost:5432/propflow?sslmode=disable

dev:
	@echo "Run 'make api' and 'make web' in separate terminals."

api:
	cd api && DATABASE_URL='$(DATABASE_URL)' go run ./cmd/api

web:
	cd web && npm run dev

test: test-api test-web

test-api:
	cd api && go test ./...

test-web:
	cd web && npm test

test-e2e:
	@test -n '$(TEST_DATABASE_URL)' || (echo "TEST_DATABASE_URL is required" && exit 1)
	@echo '$(TEST_DATABASE_URL)' | grep -Eq '(_test|test_)' || (echo "Refusing non-test database URL" && exit 1)
	cd web && TEST_DATABASE_URL='$(TEST_DATABASE_URL)' npm run test:e2e

migrate-up:
	migrate -path api/migrations -database '$(DATABASE_URL)' up

migrate-down: check-dev-db
	migrate -path api/migrations -database '$(DATABASE_URL)' down 1

seed: check-dev-db
	psql '$(DATABASE_URL)' -v ON_ERROR_STOP=1 -f api/migrations/000002_seed.up.sql

db-reset: check-dev-db
	migrate -path api/migrations -database '$(DATABASE_URL)' drop -f
	migrate -path api/migrations -database '$(DATABASE_URL)' up

check-dev-db:
	@echo '$(DATABASE_URL)' | grep -Eq '@(localhost|127\.0\.0\.1|db):[0-9]+/propflow([?]|$$)' || (echo "Refusing non-local or non-propflow database URL" && exit 1)

demo:
	docker compose up --build

demo-reset:
	docker compose down -v
	docker compose up --build

sqlc:
	cd api && sqlc generate
