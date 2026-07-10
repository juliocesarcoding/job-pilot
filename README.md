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

## Database

Run database commands from the repository root:

```bash
pnpm --filter @job-pilot/database db:generate
pnpm --filter @job-pilot/database db:migrate
pnpm --filter @job-pilot/database db:seed
```

Phase 1A migration:

- `20260710200926_phase_1a_candidate_profile_foundation`

The seed creates or resets a deterministic local development user and empty candidate profile:

- name: `Julio Cesar`
- email: `julio.dev@jobpilot.local`

Rerunning the seed clears this profile's fields, deletes this profile's experiences, and deletes this profile's candidate-skill relationships. It does not delete global `Skill` records.

Until authentication is implemented, the API resolves the current user by `JOBPILOT_DEV_USER_EMAIL`. This is a temporary development mechanism and must be replaced by real authentication later.

## Candidate Profile API

The API listens on `http://localhost:3001` by default. Candidate profile routes are scoped to the configured development user:

- `GET /api/candidate-profile`
- `PUT /api/candidate-profile`
- `POST /api/candidate-profile/experiences`
- `PUT /api/candidate-profile/experiences/:experienceId`
- `DELETE /api/candidate-profile/experiences/:experienceId`
- `POST /api/candidate-profile/skills`
- `PUT /api/candidate-profile/skills/:candidateSkillId`
- `DELETE /api/candidate-profile/skills/:candidateSkillId`

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

Phase 1A implements the candidate profile foundation only. Frontend profile screens, authentication, resume upload, AI, jobs, job matching, and application automation are not implemented yet.
