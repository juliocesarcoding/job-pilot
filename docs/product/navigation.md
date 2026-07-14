# Navigation

## Navigation Goals

Navigation should help the user understand where they are in the job-search workflow and what they should do next.

It should support frequent movement between profile readiness, resume review, job evaluation, and application tracking. The product should feel like a personal command center, not a collection of disconnected forms.

## Sidebar

The sidebar is the primary navigation surface.

It should contain stable product areas:

- Dashboard
- Profile
- Resume
- AI Review
- Jobs
- Applications
- Settings

The sidebar exists because users will regularly move between persistent workflows. It should make the product's structure predictable and reduce reliance on deep page links.

### Sidebar Behavior

The sidebar should:

- show the current primary area;
- preserve the user's mental model across sessions;
- avoid exposing backend terminology;
- avoid showing future unavailable areas as if they are active;
- support attention indicators when an area needs review.

Attention indicators should be reserved for meaningful user action. They should not be used for passive updates that do not require a decision.

### Sidebar Prioritization

The top of the sidebar should reflect daily workflow priority:

1. Dashboard
2. Jobs
3. Applications
4. AI Review
5. Profile
6. Resume
7. Settings

Profile and Resume are foundational, but once set up, the user's daily work is more likely to happen in Jobs, Applications, and AI Review. Dashboard remains first because it answers what to do next.

## Top Bar

The top bar should provide page context and high-level utilities.

It should not duplicate the sidebar. It should support:

- current page title;
- current workflow status when useful;
- global search in future phases;
- account or workspace access in future phases;
- high-priority contextual action when appropriate.

The top bar should remain secondary to the main workflow. It should not become a dense command surface too early.

## Breadcrumbs

Breadcrumbs should appear on detail pages where the user can lose context.

Use breadcrumbs for:

- job detail;
- job fit review;
- application detail;
- resume version detail;
- resume analysis detail;
- AI proposal detail.

Do not use breadcrumbs on simple top-level pages such as Dashboard, Profile, Resume, Jobs, Applications, or Settings unless the page contains nested detail navigation.

Breadcrumbs should reflect user workflow, not database hierarchy.

Preferred examples:

- Jobs / Senior Backend Engineer / Fit Review
- Applications / Acme Remote / Answer Review
- Resume / Version 3 / AI Analysis

Avoid examples:

- CandidateProfile / ResumeAnalysis / Record
- User / CandidateSkill / Update

## Contextual Actions

Contextual actions should appear near the content they affect.

Examples:

- On Resume: upload resume, extract resume text, analyze resume.
- On AI Review: accept proposal, dismiss proposal, request clarification when supported.
- On Jobs: save job, dismiss job, review fit.
- On Applications: prepare answers, mark ready, record submission.

Each screen should have one primary action aligned with its purpose. Other actions should be secondary and should not compete with the main workflow.

### Contextual Action Rules

Contextual actions should:

- be enabled only when valid;
- explain why they are unavailable when blocked;
- avoid encouraging duplicate work;
- preserve user control;
- require explicit confirmation for destructive or externally visible actions.

For example, resume analysis should be available only after extraction is completed. Application submission should never happen without explicit user action.

## Mobile Strategy

Mobile is a secondary strategy for early JobPilot because the core workflow involves reviewing resumes, jobs, AI findings, and application material. These tasks benefit from larger screens.

The mobile experience should still support:

- checking what needs attention;
- reading AI findings;
- reviewing job summaries;
- updating lightweight statuses;
- responding to urgent application tasks.

Mobile should not be optimized first for heavy editing, resume review, or complex application preparation.

### Mobile Navigation Approach

On smaller screens, primary navigation should collapse into a compact navigation surface that preserves access to the same top-level areas.

Mobile navigation should prioritize:

1. Dashboard
2. Jobs
3. Applications
4. AI Review

Profile, Resume, and Settings should remain accessible but do not need equal prominence in daily mobile use.

## Navigation Anti-Patterns

Avoid:

- navigation based on database entities;
- multiple competing primary actions on the same screen;
- hiding review requirements inside settings;
- placing AI-generated proposals directly into profile pages as accepted facts;
- making the user inspect raw extraction or analysis data before showing the implication;
- treating job discovery like an infinite generic job board.

Navigation should consistently reinforce that JobPilot is a private AI copilot focused on helping the user get interviews.
