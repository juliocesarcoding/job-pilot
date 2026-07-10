# AGENTS.md

## Project

Job Pilot is an AI-assisted international job discovery and application platform.

The platform finds remote international opportunities, evaluates compatibility with the candidate profile, prepares tailored application materials, and assists with form completion.

The system must save the user's time and avoid low-quality or clearly incompatible applications.

## Repository structure

* `apps/api`: NestJS HTTP API.
* `apps/web`: Next.js dashboard.
* `apps/worker`: BullMQ consumers and scheduled processing.
* `packages/database`: Prisma schema, migrations and database client.
* `packages/shared`: Shared schemas, types, constants and utilities.
* `packages/ai`: AI providers, prompts, schemas and evaluation services.
* `packages/job-sources`: Job source adapters and normalization.
* `docs`: Architecture, product decisions and development plans.
* `infra`: Local and deployment infrastructure.

Before making architectural changes, read the relevant documents under `docs`.

## Package manager

Use pnpm.

Do not use npm or yarn.

## Architecture rules

* Use a modular monolith for the initial version.
* Do not introduce microservices.
* Keep business logic outside controllers, route handlers and UI components.
* External services must be accessed through interfaces and adapters.
* Job source implementations must follow a common adapter contract.
* AI providers must follow a common provider contract.
* Do not access Prisma directly from controllers.
* Do not duplicate shared types between applications.
* Use dependency injection in NestJS.
* Prefer composition over inheritance.

## Backend rules

* Use NestJS modules, controllers, services and repositories.
* Validate HTTP input using DTOs and Zod schemas where appropriate.
* Controllers must only handle transport concerns.
* Services contain application use cases.
* Repositories contain persistence concerns.
* Return consistent error responses.
* Avoid `any`.
* Use strict TypeScript.
* Every public function must have an explicit return type.
* Use enums or constant objects for persisted statuses.
* Database operations that modify multiple related records must use transactions.

## Frontend rules

* Use Next.js App Router.
* Use Server Components by default.
* Use Client Components only when interaction requires them.
* Keep API access in dedicated service modules.
* Do not call the database directly from the frontend.
* Use accessible components.
* Every asynchronous screen must handle loading, empty and error states.
* Do not place business rules inside React components.

## Database rules

* Use PostgreSQL and Prisma.
* Use UUIDs for public entity identifiers.
* Include `createdAt` and `updatedAt` in persistent entities.
* Prefer soft deletion for user-owned business data.
* Add indexes for fields used in filtering, deduplication and job processing.
* Migrations must never silently remove production data.
* Do not edit an existing applied migration.

## Job collection rules

* Prefer official APIs, feeds and permitted integrations.
* Do not bypass authentication, CAPTCHAs, access controls or anti-bot protections.
* Each source must implement the shared `JobSourceAdapter` interface.
* Preserve the original source URL and external identifier.
* Normalize source data before saving it.
* Implement deterministic deduplication.
* A failure in one source must not stop other sources.

## AI rules

* AI output must be parsed through a structured schema.
* Never trust unvalidated free-form model output.
* Prompts must live in `packages/ai`.
* Store the prompt version used for important generated artifacts.
* Do not fabricate candidate experience, skills, education or achievements.
* Generated resumes and answers must only use information from the candidate profile.
* Clearly separate deterministic filters from AI recommendations.
* AI analysis must explain positive matches, gaps and blocking requirements.

## Application automation rules

* The first version must not submit applications without explicit user action.
* Playwright automation may fill forms, but the user must review before submission.
* Do not bypass CAPTCHAs.
* Do not automatically accept legal statements.
* Do not invent answers.
* Unknown questions must be presented to the user.
* Sensitive candidate data must not be written to logs.

## Security rules

* Never commit secrets.
* Use environment variables validated at application startup.
* Do not log tokens, passwords, resumes or personal application answers.
* Validate uploaded files.
* Apply rate limiting to public endpoints.
* Follow least-privilege access.
* Keep personal candidate data private by default.

## Testing rules

* Add unit tests for business rules.
* Add integration tests for repositories and critical API flows.
* Add contract tests for job source adapters.
* Add end-to-end tests only for critical user flows.
* Do not use real external APIs in automated tests.
* Mock AI responses deterministically.
* Bug fixes must include a regression test when practical.

## Commands

Before completing a task, run the commands relevant to the changed area:

* `pnpm lint`
* `pnpm typecheck`
* `pnpm test`
* `pnpm build`

Do not claim a command passed unless it was actually executed.

## Documentation

Update documentation when behavior or architecture changes.

Important documents:

* `docs/product-scope.md`
* `docs/architecture.md`
* `docs/data-model.md`
* `docs/job-scoring.md`
* `docs/roadmap.md`
* `docs/decisions/`

Record important architectural decisions as ADRs under `docs/decisions`.

## Task workflow

For each development task:

1. Read this file and the related documents.
2. Inspect the existing implementation.
3. Describe the intended changes briefly.
4. Implement the smallest complete solution.
5. Add or update tests.
6. Run validation commands.
7. Review the diff for unrelated changes.
8. Summarize:

   * files changed;
   * decisions made;
   * tests executed;
   * known limitations;
   * recommended next task.

## Constraints

* Do not rewrite working modules unnecessarily.
* Do not install a dependency when the platform or current dependencies already solve the problem.
* Do not introduce infrastructure that is not required by the current roadmap phase.
* Do not implement future roadmap items during an unrelated task.
* Do not modify generated files manually.
* Do not leave placeholder logic presented as complete.
* Do not hide errors with empty catch blocks.
* Do not weaken TypeScript, lint or test configuration to make checks pass.
