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

## Resume Upload API

JP-012 supports local resume upload infrastructure. JP-013 adds deterministic text extraction for stored PDF and DOCX resumes without AI analysis or candidate profile synchronization.

Environment variables:

```bash
RESUME_STORAGE_PROVIDER=LOCAL
RESUME_STORAGE_PATH=storage/resumes
```

Files are stored at `storage/resumes/<candidateProfileId>/<generated-file-name>`. The storage directory is created automatically. Local files under `storage/` are ignored by git.

Supported formats:

- PDF: `application/pdf`, `.pdf`
- DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `.docx`

Upload limit: 10 MB. Empty files, unknown MIME types, mismatched extensions, TXT, DOC, ZIP, images, and executables are rejected.

Resume endpoints:

- `GET /api/resumes`
- `GET /api/resumes/active`
- `GET /api/resumes/:id/download`
- `POST /api/resumes/upload` with multipart field `file`
- `DELETE /api/resumes/:id`

Uploading a resume creates version `1` when no resume exists. Each later upload increments the latest version, deactivates the previous active resume, and activates the new resume. Soft deletion never removes the physical file. If the active resume is deleted and another version exists, the latest previous version is activated. The only active resume cannot be deleted.

## Resume Extraction API

Resume extraction reads the file already stored by the resume upload API. It does not duplicate files, perform OCR, call AI providers, infer skills, infer work history, infer education, or update `CandidateProfile`.

Supported extraction formats:

- PDF resumes through `pdf-parse`
- DOCX resumes through `mammoth`

Extraction metadata includes word count, detected language when basic evidence is available (`en`, `pt`, or `es`), extraction duration in milliseconds, parser name, format, and PDF page count when applicable. DOCX page count is stored as `null` because DOCX files do not have stable pages until rendered.

Extraction statuses:

- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

Extraction endpoints:

- `POST /api/resumes/:resumeId/extract`
- `GET /api/resumes/:resumeId/extraction`

`POST /api/resumes/:resumeId/extract` validates ownership, rejects unsupported stored formats with `400`, returns `404` when the resume does not belong to the current development user, returns `409` when an extraction already exists, and stores `FAILED` without exposing internal parser or storage exceptions when extraction fails.

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

Phase 1A implements the candidate profile foundation and JP-012 implements resume upload infrastructure. Frontend profile screens, authentication, resume parsing, AI, jobs, job matching, and application automation are not implemented yet.
