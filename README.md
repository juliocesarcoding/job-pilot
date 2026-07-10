# Job Pilot

Job Pilot is an AI-assisted international job discovery and application platform. This repository now contains the Phase 0 foundation for a pnpm + Turborepo monorepo with NestJS, Next.js, a BullMQ worker, Prisma, shared packages, Docker Compose, documentation, and initial smoke tests.

## Local development

Prerequisites:

- Node.js with Corepack enabled.
- pnpm 9.15.0, as declared in `package.json`.
- Docker with Docker Compose.

1. Install dependencies from the repository root:
   ```bash
   pnpm install
   ```
2. Copy local environment settings:
   ```bash
   cp .env.example .env
   ```
3. Start local infrastructure:
   ```bash
   docker compose up -d postgres redis
   ```
4. Verify infrastructure:
   ```bash
   docker compose ps
   docker compose exec postgres pg_isready -U postgres -d jobpilot
   docker compose exec redis redis-cli ping
   ```
5. Run the workspace:
   ```bash
   pnpm dev
   ```

## Available commands

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm format`

## Running individual services

Run these commands from the repository root:

```bash
pnpm --filter @job-pilot/api dev
pnpm --filter @job-pilot/web dev
pnpm --filter @job-pilot/worker dev
```

After building, production-style starts are:

```bash
pnpm build
pnpm --filter @job-pilot/api start
pnpm --filter @job-pilot/web start
pnpm --filter @job-pilot/worker start
```

The API listens on `http://localhost:3001` by default and exposes `GET /api/health`.
The web app listens on `http://localhost:3000` by default and exposes `GET /api/health`.

## Notes

Phase 0 intentionally focuses on infrastructure, developer experience, and health checks. Candidate profiles, job collection, and AI features are not implemented yet.
