# Product Vision

## Product Positioning

JobPilot is a personal AI copilot for software engineers pursuing international remote jobs.

It helps the user discover relevant opportunities, understand fit, prepare application materials, answer repetitive questions, and track progress across many applications. The product exists to reduce the operational burden of job searching while keeping the user in control of every important decision.

JobPilot is not an applicant tracking system, recruitment marketplace, social network, or public professional profile. It is a private workspace for one person trying to get better interviews with less repetitive effort.

## Value Proposition

JobPilot helps experienced software professionals turn existing career assets into an active international job search system.

Most users already have a resume, LinkedIn profile, GitHub profile, and real professional history. JobPilot should not make them rebuild that identity from scratch. It should help them organize what they already have, identify what is missing, and use that context to move faster through job discovery and application workflows.

The core value is not data entry. The core value is progress toward interviews.

JobPilot should help users:

- maintain a reliable candidate profile as a source of truth;
- understand whether their resume represents them well;
- create and manage multiple resume versions when needed;
- identify relevant international remote roles;
- avoid low-quality or clearly incompatible opportunities;
- prepare application material using only verified candidate information;
- reduce repeated answers across application forms;
- track what needs attention next.

## Design Principles

### Workflow Over Forms

Forms are a means to make progress, not the product experience. The interface should organize work around job-search outcomes: improve profile readiness, review resume quality, evaluate opportunities, prepare applications, and follow up.

When forms are necessary, they should appear in context and explain what progress they unlock.

### Actions Over Configuration

The product should prioritize the next useful action. Users should not need to configure the system extensively before seeing value.

Examples of preferred product language:

- Review resume findings.
- Improve profile readiness.
- Analyze job fit.
- Prepare application answers.
- Follow up on applications.

Examples of product language to avoid:

- Manage entities.
- Configure analysis settings.
- Create records.
- Execute pipeline.

### Progressive Disclosure

The product should reveal detail when it becomes useful. A senior engineer should be able to scan the workspace quickly, understand what needs attention, and open deeper information only when needed.

This is especially important for AI output. The first layer should summarize confidence, gaps, risks, and recommended actions. Evidence, extracted text, parser metadata, and detailed structured output belong behind review-oriented surfaces.

### One Primary Action Per Screen

Each major page should make the next most valuable action clear. Secondary actions may exist, but they should not compete with the screen's purpose.

Examples:

- Dashboard: continue the highest-priority job-search task.
- Profile: improve candidate readiness.
- Resume: review and prepare the active resume.
- Jobs: evaluate the next relevant opportunity.
- Applications: resolve the next application that needs attention.

### AI Assists the User

AI should reduce effort, surface patterns, draft material, and explain reasoning. It should not act as an unreviewed authority.

AI should:

- explain positive matches;
- identify gaps and blocking requirements;
- cite the candidate information used;
- separate evidence from inference;
- ask for user confirmation before applying changes;
- present uncertain information as uncertain.

AI should not:

- fabricate experience, skills, education, or achievements;
- submit applications without explicit user action;
- silently modify the candidate profile;
- hide uncertainty behind confident language;
- replace the user's career judgment.

### Reduce Cognitive Load

The user may be managing dozens of jobs, several resume variants, and repeated application questions. JobPilot should reduce the number of things the user must remember.

The product should make state visible:

- what is ready;
- what is missing;
- what changed;
- what requires review;
- what can be ignored;
- what should happen next.

### Minimize Repetitive Work

Repeated work is one of the main user pains. JobPilot should remember reviewed candidate information and reuse it safely across workflows.

The product should ask once, reuse when appropriate, and show the user when reused information affects an application.

## User Philosophy

JobPilot is built for capable users who do not need hand-holding, but do need leverage.

Senior engineers understand their experience and career goals. The product should respect that expertise. It should not talk down to the user or force them through beginner-oriented onboarding. It should act like a precise assistant that keeps the job search moving.

The user should feel:

- their time is respected;
- their professional history is treated carefully;
- the system understands international remote job search;
- the product is helping them get interviews;
- they remain in control of what is submitted.

## Product Personality

JobPilot should feel focused, trustworthy, and quietly proactive.

It should be:

- professional without being corporate;
- intelligent without being opaque;
- direct without being cold;
- efficient without feeling rushed;
- careful with personal data;
- transparent about AI limitations.

The product should avoid inflated claims, vague motivational language, and generic career-coach phrasing. It should communicate through useful next steps, clear status, and evidence-based recommendations.
