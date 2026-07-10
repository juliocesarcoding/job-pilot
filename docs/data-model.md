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

## Temporary Development User

Until authentication exists, the API resolves the current user by `JOBPILOT_DEV_USER_EMAIL`.

The default local value is:

```bash
JOBPILOT_DEV_USER_EMAIL=julio.dev@jobpilot.local
```

The seed creates `Julio Cesar <julio.dev@jobpilot.local>` and an empty candidate profile. This mechanism must be replaced when authentication is implemented.
