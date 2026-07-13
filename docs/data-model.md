# Data model

Phase 1A introduces the first business data model: candidate profile ownership and profile details.

## Migration

The first real migration is `20260710200926_phase_1a_candidate_profile_foundation`. It creates the initial health-check table plus the candidate profile foundation tables and enums.

Run migrations from the repository root:

```bash
pnpm --filter @job-pilot/database db:migrate
```

Generate the Prisma client:

```bash
pnpm --filter @job-pilot/database db:generate
```

Run the local development seed:

```bash
pnpm --filter @job-pilot/database db:seed
```

## Entities

- `User`: owns candidate data. Authentication is not implemented yet. Users support soft deletion through `deletedAt`.
- `CandidateProfile`: one profile per user, including headline, summary, location, preferences, salary expectations, links, and soft deletion.
- `Experience`: work-history entries owned by a candidate profile, with soft deletion, date consistency enforced in application validation, and PostgreSQL string arrays for achievements and technologies.
- `Skill`: global normalized skill catalog entries.
- `CandidateSkill`: candidate-to-skill relationship with proficiency metadata and a unique `candidateProfileId + skillId` constraint.
- `Resume`: versioned resume file metadata owned by a candidate profile. Resume files are stored through a storage provider.
- `ResumeExtraction`: one-to-one structured text extraction result for a resume. It stores extraction status, raw extracted text, detected language, page count, word count, and parser metadata. It does not update `CandidateProfile`.
- `ResumeAnalysis`: one-to-one structured AI analysis result for a completed resume extraction. It stores provider/model metadata, prompt version, token usage, confidence when available, status, errors, and the validated JSON analysis. It does not update candidate profile entities.

## Resume Storage

JP-012 supports local resume storage only:

```bash
RESUME_STORAGE_PROVIDER=LOCAL
RESUME_STORAGE_PATH=storage/resumes
```

Files are stored under `storage/resumes/<candidateProfileId>/<generated-file-name>`. The original filename is retained as metadata only; stored filenames are generated UUIDs with the validated extension.

Supported upload formats:

- PDF: `application/pdf`, `.pdf`
- DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `.docx`

Maximum file size is 10 MB. Empty files, unknown MIME types, mismatched extensions, TXT, DOC, ZIP, images, and executables are rejected.

Resume versioning starts at `1`. Uploading a new resume preserves previous metadata/files, deactivates the previous active version, and activates the new version. Soft deletion never removes the physical file. If the active resume is soft-deleted and another version exists, the latest previous version becomes active.

## Resume Extraction

JP-013 extracts raw text from stored PDF and DOCX resumes:

- PDF extraction uses `pdf-parse` and stores page count.
- DOCX extraction uses `mammoth`; page count is `null` because DOCX page count depends on rendering.
- OCR and image-based extraction are not supported.
- AI providers are not called.
- Skills, experience, education, summaries, and candidate profile fields are not inferred.

Each resume may have one `ResumeExtraction`.

`ExtractionStatus` values:

- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

Stored metadata includes:

- format
- parser
- word count
- detected language (`en`, `pt`, `es`, or `null`)
- extraction duration in milliseconds
- PDF page count when available
- parser warnings when available

Extraction endpoints:

- `POST /api/resumes/:resumeId/extract`
- `GET /api/resumes/:resumeId/extraction`

Extraction failures store a `FAILED` record with sanitized metadata and no partial extracted text.

## Resume Analysis

JP-014 adds structured AI analysis after extraction:

```text
Resume -> ResumeExtraction -> ResumeAnalysis
```

`ResumeAnalysis` can only be created when the linked `ResumeExtraction` is `COMPLETED`. The current provider implementation is OpenAI behind the `ResumeAnalysisProvider` interface, so future providers can be swapped without changing controllers or use-case services.

`AnalysisStatus` values:

- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

Stored analysis metadata includes:

- provider
- model
- prompt version
- validated analysis JSON
- confidence when returned by the provider
- input, output, and total token usage when available
- started and finished timestamps
- sanitized failure message when failed

Prompt version:

- `1.0.0`

The analysis JSON is validated with Zod before persistence and contains:

- summary
- skills
- experience
- education
- languages
- certifications

Analysis endpoints:

- `POST /api/resumes/:resumeId/analyze`
- `GET /api/resumes/:resumeId/analysis`

The AI analysis is a proposal only. It never updates `CandidateProfile`, `Experience`, `Skill`, or `CandidateSkill`.

## Temporary Development User

Until authentication exists, the API resolves the current user by `JOBPILOT_DEV_USER_EMAIL`.

The default local value is:

```bash
JOBPILOT_DEV_USER_EMAIL=julio.dev@jobpilot.local
```

The seed creates `Julio Cesar <julio.dev@jobpilot.local>` and an empty candidate profile. This mechanism must be replaced when authentication is implemented.
