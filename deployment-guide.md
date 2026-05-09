# Deployment Guide

## Current App

The current app is a Vite React frontend.

```bash
npm install
npm run lint
npm run test
npm run build
npm run preview
```

## Required Environment

Copy `.env.example` to `.env.local` and fill provider keys as features are enabled.

## Recommended Production Path

1. Deploy frontend to Vercel, Netlify, Cloudflare Pages, or an S3/CDN setup.
2. Add a backend API on Render, Fly.io, Railway, AWS ECS, or Kubernetes when persistence lands.
3. Use Postgres with PostGIS, Redis, object storage, and a CDN.
4. Run migrations in CI/CD before promoting releases.
5. Add separate staging and production environments with different payment, maps, AI, and messaging credentials.

## CI/CD Gates

Every pull request should run install, lint, tests, build, dependency audit, and Lighthouse checks for marketplace and dashboard paths.
