# Roadmap

## Phase 0 — Foundation

- Create a pnpm + Turborepo monorepo.
- Scaffold the API, web app, worker, database, shared, AI, and job-source packages.
- Configure strict TypeScript, ESLint, Prettier, Docker Compose, Prisma, environment validation, health checks, and smoke tests.

## Phase 1A — Candidate Profile Foundation

- Add candidate ownership through the `User` model without authentication.
- Add candidate profile, experience, skill, and candidate skill persistence.
- Add candidate profile API endpoints for the fixed local development user.
- Seed the local development user and empty candidate profile.

## JP-012 — Resume Upload Infrastructure

- Add versioned resume metadata and local storage.
- Support PDF and DOCX upload/download/listing for the development user's candidate profile.
- Keep resume contents unparsed for future extraction phases.

## JP-013 — Resume Text Extraction

- Add one-to-one resume extraction persistence with status tracking.
- Extract raw text from stored PDF and DOCX resumes.
- Store word count, basic detected language, PDF page count, extraction duration, and parser metadata.
- Expose extraction and retrieval endpoints without AI analysis or candidate profile synchronization.

## JP-014 — Resume AI Analysis

- Add one-to-one resume analysis persistence linked to completed resume extractions.
- Analyze extracted resume text through an interchangeable AI provider abstraction.
- Implement an OpenAI provider with prompt version `1.0.0`.
- Validate structured JSON analysis with Zod before persistence.
- Store provider, model, prompt version, confidence, token usage, status, and sanitized errors.
- Expose analysis and retrieval endpoints without candidate profile synchronization.

## Future phases

- Job collection and normalization.
- AI evaluation and recommendation flows.
- Application automation and review workflows.
