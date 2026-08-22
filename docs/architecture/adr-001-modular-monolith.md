# ADR 001: Modular monolith

Status: Accepted  
Date: 23 August 2026

## Context

PropFlow and FindYourKeja share identity, properties, units, listings, inquiries, tenancies, payments, maintenance, and audit data. The MVP must be delivered and operated as one coherent vertical product by 26 August 2026.

## Decision

Use one React/Vite web application, one Go `net/http` application using Chi, and one PostgreSQL database. Backend code is organized by domain boundaries inside one deployable module. The public marketplace and authenticated portals share an API contract, server-side sessions, design tokens, and one database.

The production-like demo uses one public web origin. Nginx serves the Vite bundle, proxies `/api` to Go, and falls back to `index.html` for browser routes.

## Consequences

- Cross-domain operations can use PostgreSQL transactions without distributed coordination.
- One team can test and deploy the complete golden path together.
- Domain packages and repository interfaces retain future extraction options if measured operational pressure justifies it.
- Redis, queues, Kubernetes, PostGIS, live payments, document storage, and AI are intentionally absent from P0.
