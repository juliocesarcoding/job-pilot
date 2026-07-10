# ADR 0001: Foundation monorepo structure

- Status: Accepted
- Date: 2026-07-10

## Context

The project needs a maintainable monorepo foundation that can evolve into a modular application without introducing unnecessary complexity in the first phase.

## Decision

The repository uses pnpm workspaces and Turborepo to orchestrate the API, web app, worker, database, shared, AI, and job-source packages. Shared tooling is configured at the root so that linting, formatting, type checking, and testing remain consistent across the workspace.

## Consequences

This phase establishes a predictable structure for future feature development while keeping the initial implementation intentionally small.
