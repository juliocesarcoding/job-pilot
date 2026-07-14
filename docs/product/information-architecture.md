# Information Architecture

## Product Organization

JobPilot is organized around the user's job-search workflow rather than backend entities.

The primary mental model is:

1. Prepare my candidate foundation.
2. Understand and improve my resume.
3. Find relevant jobs.
4. Evaluate fit.
5. Prepare and track applications.
6. Review what needs attention next.

This structure keeps the product focused on helping the user get interviews instead of asking them to maintain records.

## Primary Navigation

The primary navigation should contain:

- Dashboard
- Profile
- Resume
- AI Review
- Jobs
- Applications
- Settings

### Dashboard

The Dashboard exists to answer what the user should do next.

It should not be a generic analytics page. It should summarize job-search readiness, pending reviews, relevant opportunities, application follow-ups, and blockers. Its purpose is orientation and prioritization.

### Profile

The Profile area exists to maintain the candidate source of truth.

It should include professional identity, experience, skills, preferences, location, compensation expectations, links, and constraints such as visa sponsorship. This information powers later job matching and application material generation.

The page should not feel like a public profile editor. It is a private professional data foundation for the copilot.

### Resume

The Resume area exists to manage resume versions and prepare resume content for downstream AI workflows.

It should include upload, active version, version history, extraction status, and analysis status. Its purpose is to help the user understand whether the current resume is usable, complete, and aligned with their goals.

### AI Review

AI Review exists to collect AI-generated findings that require user judgment.

This includes resume analysis findings, proposed profile updates, job-fit explanations, generated application answers, and future review queues. It should clearly separate suggestions from accepted candidate data.

AI Review is important because JobPilot must never silently replace the user's decisions.

### Jobs

Jobs exists to discover and evaluate international remote opportunities.

It should focus on relevance, fit, blockers, compensation alignment, location constraints, visa requirements, and evidence. It should not become a broad job board. Its purpose is to reduce time spent on low-quality or incompatible opportunities.

### Applications

Applications exists to track active application work.

It should show applications in progress, submitted applications, follow-ups, pending user input, generated materials, unanswered questions, and status history. Its purpose is operational memory.

### Settings

Settings exists for product configuration, integrations, privacy controls, account details, and future automation preferences.

Settings should not absorb workflow decisions that belong in context. For example, resume selection belongs in Resume or Applications, not global settings.

## Secondary Navigation

Secondary navigation should appear within major areas only when the area has multiple distinct jobs to be done.

### Profile Secondary Sections

- Overview
- Experience
- Skills
- Preferences
- Links

Each section exists because it represents a different type of candidate information used by downstream workflows.

### Resume Secondary Sections

- Active Resume
- Versions
- Extraction
- Analysis

Each section maps to the resume lifecycle: upload, preserve history, extract text, review AI findings.

### Jobs Secondary Sections

- Recommended
- Saved
- Dismissed
- Sources
- Search Criteria

These sections distinguish opportunity evaluation from source management and user intent.

### Applications Secondary Sections

- Needs Attention
- Drafting
- Ready to Submit
- Submitted
- Archived

These sections reflect work state rather than database status alone.

### Settings Secondary Sections

- Account
- Integrations
- Privacy
- Notifications
- Automation Preferences

Settings sections should remain secondary to the core workflow.

## Page Hierarchy

### Top-Level Pages

Top-level pages represent durable product areas that users return to often:

- Dashboard
- Profile
- Resume
- AI Review
- Jobs
- Applications
- Settings

### Detail Pages

Detail pages should exist when the user needs to inspect, compare, or decide:

- Resume version detail
- Resume analysis detail
- Job detail
- Job fit review
- Application detail
- Application answer review
- AI proposal detail

Detail pages should retain context from the parent workflow and provide a clear return path.

### Modal or Inline Flows

Short focused actions may be inline or transient:

- add skill;
- add experience;
- upload resume;
- confirm deletion;
- accept or reject one AI proposal;
- save a job;
- dismiss a job.

Longer decisions should use dedicated pages or review surfaces.

## Information Hierarchy

The information hierarchy should prioritize decision-making.

### First Level: Status and Next Action

The first level should answer:

- Is this area ready?
- What needs attention?
- What is the recommended next action?

### Second Level: Summary and Evidence

The second level should show:

- concise summaries;
- readiness indicators;
- AI confidence when applicable;
- important gaps;
- blocking requirements;
- source evidence.

### Third Level: Detailed Data

The third level should contain:

- full profile fields;
- full experience details;
- complete skill metadata;
- resume version metadata;
- extracted text;
- parser metadata;
- token usage;
- raw analysis structure where useful.

Detailed data is necessary, but it should not dominate the primary workflow.

## Why Each Section Exists

### Candidate Data

Candidate data exists to prevent repetition. Once the user confirms a fact about their career, the product should reuse it safely.

### Resume Data

Resume data exists because resumes are the main artifact used in job applications and AI review. Version history matters because different opportunities may require different positioning.

### AI Findings

AI findings exist to accelerate review. They should identify what is useful, missing, uncertain, or risky. They should never become accepted truth without the user's decision.

### Jobs

Jobs exist to focus the user's attention on relevant opportunities. The product should reduce browsing and increase qualified application decisions.

### Applications

Applications exist to manage many parallel processes. The user should not need to remember which application needs a resume update, a follow-up, an answer, or a final review.

### Settings

Settings exist to control the product environment. They should be stable, predictable, and separate from daily job-search work.
