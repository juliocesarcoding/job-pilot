# Dashboard Specification

## Page Purpose

The Dashboard is the first screen users see after onboarding. It is the user's personal AI job-search command center.

Its purpose is to create momentum by identifying the most valuable next action, surfacing work that needs attention, and showing whether the user is ready to apply to relevant international remote jobs.

The Dashboard must answer, in order:

1. What should I do next?
2. What needs my attention?
3. Am I ready to apply?
4. Did AI prepare something for me?
5. Which opportunities deserve my attention?

The Dashboard is not an analytics surface, profile editor, resume manager, job board, or AI transcript. It exists to move the user closer to interviews.

## User Goals

The Dashboard should help the user:

- understand the highest-value action to take now;
- see whether their candidate foundation is ready for job matching and applications;
- identify blockers that prevent useful AI assistance;
- review AI-generated findings before they affect profile data or application material;
- find high-signal jobs when job discovery exists;
- keep track of active application work when applications exist;
- avoid spending time on low-value or incompatible opportunities.

## Page Hierarchy

The Dashboard hierarchy should be:

1. Sidebar navigation
2. Header
3. Next Best Action
4. Attention Queue
5. Candidate Readiness
6. Recommended Jobs
7. Applications Summary
8. Recent AI Activity
9. Recent Activity

This order prioritizes action before observation. The user should not need to scan the entire page to know what matters.

## Content Hierarchy

Every Dashboard section should follow the same content logic:

1. State: what is happening or missing.
2. Meaning: why it matters for getting interviews.
3. Action: what the user can do next.
4. Destination: where the user goes to complete the action.

The Dashboard should avoid exposing raw implementation details. Detailed records, long generated content, extracted resume text, parser metadata, complete AI payloads, and full application histories belong in their dedicated areas.

## Information Priority

Information should be prioritized by user actionability:

1. Blocking tasks that prevent applying or useful AI assistance.
2. AI findings requiring user review.
3. Jobs or applications requiring timely user attention.
4. Readiness signals that explain whether the system can help.
5. Recent activity that provides context.
6. Passive historical information.

Passive information should never compete with urgent work.

## Primary CTA

The primary CTA on the Dashboard belongs to Next Best Action.

There should be exactly one primary Dashboard action at a time. It should route the user to the workflow where progress happens.

Examples:

- Complete profile basics.
- Upload resume.
- Extract resume text.
- Review resume analysis.
- Review recommended jobs.
- Answer application questions.
- Follow up on applications.

The CTA label should describe the user's outcome, not the backend operation.

## Secondary Actions

Secondary actions may appear in individual sections when they help the user continue a workflow without competing with the primary action.

Examples:

- View all attention items.
- Open Profile.
- Open Resume.
- View all jobs.
- View applications.
- Open AI Review.

Secondary actions should be navigational or review-oriented. They should not introduce competing primary workflows on the Dashboard.

## Layout

### Sidebar

The sidebar is the persistent product navigation. It should anchor the user in the overall job-search system and show which major areas require attention.

The Dashboard item is the current page and should be visually and semantically marked as active in implementation.

### Header

The header introduces the workspace state for the current user. It should provide orientation without becoming the main action area.

### Main Content

The main content should be organized around decision-making. The first section should always be Next Best Action. Supporting sections should explain why that action matters and what else is waiting.

### Card Organization

Dashboard content should be grouped into clear sections that each answer one question. Cards or grouped areas should not be treated as a widget gallery. A section exists only if it helps the user decide what to do next or understand readiness.

Sections should use concise summaries and route to dedicated pages for detail.

## Sidebar Specification

### Menu Order

The sidebar order should be:

1. Dashboard
2. Jobs
3. Applications
4. AI Review
5. Profile
6. Resume
7. Settings

### Why Each Item Exists

Dashboard exists to orient the user and recommend the next best action.

Jobs exists to review relevant international remote opportunities once job discovery is available.

Applications exists to track active application work, unanswered questions, drafts, submissions, and follow-ups.

AI Review exists to collect AI-generated findings that require user judgment before they affect profile data or application material.

Profile exists to maintain the candidate source of truth used by matching and generated material.

Resume exists to manage resume versions, extraction, and analysis.

Settings exists for account, integrations, privacy, notifications, and automation preferences.

### Badges and Attention Indicators

Badges should indicate user action required, not passive updates.

Valid badge sources:

- AI review items pending decision;
- applications needing user input;
- follow-ups due;
- failed resume extraction or analysis;
- incomplete profile requirements that block matching or applications;
- high-fit jobs requiring timely review when job discovery exists.

Badges should not be used for:

- every new job found;
- every completed background task;
- passive activity logs;
- historical counts with no action required.

### Current Page Behavior

When the user is on Dashboard:

- Dashboard is marked as the active sidebar item;
- no breadcrumb is required;
- attention badges on other items remain visible;
- clicking Dashboard should return to the top-level command center state.

## Header Specification

### Page Title

The page title should identify the screen as the user's job-search command center.

Recommended title: `Dashboard`

Supporting copy should communicate the screen's purpose in one concise sentence.

### Greeting

The greeting should feel personal but not decorative. It may reference the user's first name when available.

The greeting should support momentum. It should not use generic motivation or inflated claims.

Example direction:

- Welcome back. Here is what needs attention in your job search.
- Your job-search workspace is ready. Start with the highest-impact next step.

### Quick Actions

Quick actions may appear in the header only when they are globally useful and do not compete with Next Best Action.

Valid quick actions:

- Upload resume.
- Open AI Review.
- View recommended jobs.
- View applications.

If a quick action duplicates the current Next Best Action, the Next Best Action remains primary.

### Future Search Placeholder

The header may reserve a future location for global search, but search behavior should not be designed in this specification.

Future search should support finding jobs, applications, resume versions, AI reviews, and profile information. It should not be required for the first Dashboard implementation.

## Main Sections

## Next Best Action

### Purpose

Next Best Action tells the user the single most valuable thing to do now.

### Why It Exists

The user should not need to inspect every page to decide where to start. The product should synthesize state across profile, resume, AI review, jobs, and applications into one recommended action.

### When It Appears

Next Best Action always appears.

### When It Disappears

It never disappears. If there is no urgent work, it should recommend a positive next step such as reviewing new jobs, improving profile strength, or checking application follow-ups.

### Priority

This is the highest-priority Dashboard section.

### User Action

The section should provide one primary CTA that routes the user to the relevant workflow.

### Expected Data

The section may use:

- profile readiness state;
- resume availability;
- extraction state;
- analysis state;
- pending AI review count;
- pending application tasks;
- follow-up due state;
- recommended job availability.

### Behavior

The recommendation should follow a priority model based on blockers and user value. It should not require a percentage algorithm.

Recommended priority order:

1. Resolve application tasks that block submission or follow-up.
2. Review AI findings that affect profile or application material.
3. Fix failed resume extraction or analysis.
4. Complete missing candidate information required for matching.
5. Upload or prepare the active resume.
6. Review high-fit jobs.
7. Improve profile or resume quality.

### Examples

First-time user:

- Message: Your profile needs a few basics before JobPilot can help with matching.
- Primary action: Complete profile basics.

Resume uploaded but not extracted:

- Message: Your active resume is uploaded. Extract its text so AI can review it.
- Primary action: Extract resume text.

Extraction completed but analysis missing:

- Message: Your resume text is ready. Analyze it to find profile and resume gaps.
- Primary action: Analyze resume.

Analysis completed:

- Message: AI found resume insights that need your review.
- Primary action: Review AI findings.

Future job discovery:

- Message: JobPilot found high-fit remote roles that match your profile.
- Primary action: Review recommended jobs.

Future applications:

- Message: Two application drafts need your answers before they can be reviewed.
- Primary action: Answer application questions.

## Candidate Readiness

### Purpose

Candidate Readiness explains whether JobPilot has enough trusted candidate information to help the user apply effectively.

### Why It Exists

The user needs confidence that the system can evaluate jobs and prepare material without inventing information. Readiness makes gaps visible without turning the Dashboard into a profile form.

### When It Appears

Candidate Readiness always appears.

### When It Disappears

It does not disappear, but it becomes less prominent when all core readiness areas are ready and there are higher-priority jobs or applications.

### Priority

Candidate Readiness appears after the Attention Queue. It supports the primary action but should not outrank urgent application or review work.

### User Action

The section should route users to the specific area that needs work:

- Profile
- Resume
- Resume extraction
- Resume analysis
- AI Review

### Expected Data

Candidate Readiness should present four readiness areas:

- Profile ready
- Resume ready
- Extraction ready
- Analysis ready

### Readiness Rules

Do not invent a percentage algorithm.

Readiness should be represented as state-based checks:

Profile ready means the candidate profile contains enough verified information for matching and generated material. Missing headline, summary, experience, skills, desired role, location constraints, or compensation preferences may reduce readiness depending on future matching needs.

Resume ready means there is an active resume version that can be used for application workflows.

Extraction ready means the active resume has completed text extraction. Failed or missing extraction means AI cannot reliably analyze the resume.

Analysis ready means the active resume has completed AI analysis and any generated findings are available for review. A failed analysis should be treated as attention required.

### Missing Requirements

Missing requirements should be explained by impact:

- Missing profile information limits job matching.
- Missing resume prevents application preparation.
- Missing extraction prevents AI resume analysis.
- Missing analysis prevents AI review and resume improvement suggestions.
- Pending AI review means the system has suggestions, but they are not accepted candidate truth.

## Attention Queue

### Purpose

Attention Queue collects items that require user decision or intervention.

### Why It Exists

The user should not need to remember what is pending across profile, resume, AI review, jobs, and applications. The queue reduces anxiety by making required action explicit.

### When It Appears

It appears when at least one item requires user attention.

### When It Disappears

It disappears when there are no actionable attention items. In that state, the Dashboard should not show an empty queue unless doing so reinforces calm, such as a short "Nothing needs attention right now" state.

### Priority

Attention Queue appears directly after Next Best Action.

### User Action

Each item should route to the exact workflow where the user can resolve it.

### Expected Data

Events that belong in Attention Queue:

- AI review pending;
- failed resume extraction;
- failed resume analysis;
- incomplete profile requirements that block useful matching;
- missing active resume;
- extraction not completed for active resume;
- application follow-up due;
- application questions requiring user input;
- application draft ready for final review;
- high-fit job with unresolved blocking requirement when job discovery exists.

### Prioritization

Attention items should be ordered by urgency and dependency:

1. Time-sensitive application work.
2. Items blocking application submission.
3. AI review items affecting candidate truth or generated materials.
4. Resume failures blocking AI workflows.
5. Missing profile or resume requirements.
6. Job review items.

The queue should avoid showing duplicates when one item already represents the same user action as Next Best Action.

## Recommended Jobs

### Purpose

Recommended Jobs surfaces opportunities that deserve attention.

### Why It Exists

The product should reduce time spent browsing low-quality jobs. This section should show a small set of high-signal opportunities once job discovery exists.

### Before Job Discovery Exists

Before job discovery is implemented, this section should not show fake jobs.

It should communicate that recommendations will appear after job discovery is available and the candidate foundation is prepared. If profile or resume readiness is incomplete, the section should explain which readiness step unlocks better recommendations.

Valid states before job discovery:

- Not available yet.
- Waiting for profile readiness.
- Waiting for resume readiness.

### After Job Discovery Exists

After job discovery exists, the section should show a curated set of recommended roles, not an infinite feed.

Each job summary should explain why the role deserves attention:

- role and company;
- remote and international relevance;
- fit summary;
- positive matches;
- gaps or blockers;
- source freshness;
- salary or location relevance when known.

### When It Appears

It appears when job discovery is available or when the product needs to explain why recommendations are not available yet.

### When It Disappears

It may disappear if job discovery is disabled and there is a higher-priority onboarding or readiness flow. It should return once jobs become part of the active workflow.

### Priority

Recommended Jobs appears after readiness because job relevance depends on candidate information.

### User Action

Primary section action:

- Review recommended jobs.

Secondary actions:

- View saved jobs.
- Update search criteria.

### Expected Data

Future data:

- normalized job records;
- fit analysis;
- blockers;
- source information;
- saved or dismissed state;
- freshness.

## Applications Summary

### Purpose

Applications Summary shows the state of active application work.

### Why It Exists

Application work can become fragmented across jobs, resumes, generated answers, follow-ups, and user decisions. This section keeps the user from losing track.

### Before Applications Exist

Before Applications are implemented, this section should not show fake pipeline data.

It should explain that applications will appear after the user starts preparing or tracking applications. If jobs are not available yet, it should remain low priority or absent depending on the first implementation state.

### After Applications Exist

After Applications exist, the section should summarize work by action state:

- needs user input;
- draft in progress;
- ready for final review;
- submitted;
- follow-up due;
- archived or inactive.

The section should emphasize applications requiring action, not total counts.

### When It Appears

It appears when application tracking is available or when there are active application tasks.

### When It Disappears

It may disappear when there are no applications and the product has not yet introduced application tracking to the user.

### Priority

Applications Summary becomes high priority when applications require user action. Otherwise it appears below Recommended Jobs.

### User Action

Primary section action:

- Continue application work.

Other actions:

- Review ready applications.
- Answer missing questions.
- View submitted applications.

### Expected Data

Future data:

- application records;
- application status;
- user-required questions;
- generated answer drafts;
- resume version used;
- follow-up dates;
- submission state.

## Recent AI Activity

### Purpose

Recent AI Activity shows what AI prepared, analyzed, or flagged for review.

### Why It Exists

AI should feel useful and transparent. The user should know when AI has done work, but the Dashboard must not become an AI transcript.

### When It Appears

It appears when there are recent AI events or pending AI review items.

### When It Disappears

It disappears when there is no AI activity and no pending AI review. The Dashboard should not invent AI activity.

### Priority

Recent AI Activity appears below workflow summaries unless there is an AI review item that also belongs in Attention Queue.

### User Action

Actions should route to AI Review or the relevant detail page.

Examples:

- Review resume findings.
- Review job-fit explanation.
- Review generated answers.

### Expected Data

AI events that belong here:

- resume analysis completed;
- resume analysis failed;
- resume findings awaiting review;
- job-fit analysis completed;
- application answer draft generated;
- AI flagged a blocking requirement;
- AI found uncertainty requiring user confirmation.

### Communicating Uncertainty

AI activity should communicate uncertainty directly.

Preferred patterns:

- AI found a possible gap in leadership evidence.
- AI could not confirm visa sponsorship requirements from the job post.
- AI drafted an answer using your confirmed profile information.
- AI needs your review before this becomes part of your profile.

Avoid patterns:

- AI confirmed your profile is complete when evidence is partial.
- AI says this job is perfect.
- AI updated your experience.
- AI knows you meet all requirements.

AI should distinguish:

- confirmed candidate data;
- extracted resume evidence;
- AI inference;
- missing evidence;
- user-required decision.

## Recent Activity

### Purpose

Recent Activity provides lightweight operational memory.

### Why It Exists

The user should understand what changed recently without opening every product area.

### When It Appears

It appears when there is recent user or system activity.

### When It Disappears

It may disappear for first-time users with no activity. It should not show artificial placeholder history.

### Priority

Recent Activity is the lowest-priority Dashboard section because it is contextual rather than directly actionable.

### User Action

Most items should be informational. Items may route to the relevant detail page when useful.

### Expected Data

User and system events that belong here:

- profile updated;
- experience added;
- skill added;
- resume uploaded;
- resume version deleted;
- extraction completed;
- extraction failed;
- analysis completed;
- analysis failed;
- AI review item accepted or dismissed;
- job saved or dismissed;
- application created, updated, submitted, or archived.

### History Amount

Show only a short recent history. The Dashboard should summarize recent change, not become an audit log.

Full history belongs inside the relevant detail page or future activity history.

## Dashboard States

## First-Time User

The first-time Dashboard should help the user reach first value quickly.

Expected behavior:

- Next Best Action points to completing the candidate foundation.
- Candidate Readiness explains what is missing.
- Recommended Jobs does not show fake opportunities.
- Applications Summary is absent or explains that applications appear later.
- Recent AI Activity is absent until AI has performed work.
- Recent Activity is absent or limited to onboarding completion.

The first-time state should not overwhelm the user with every future capability.

## Returning User

The returning Dashboard should prioritize continuity.

Expected behavior:

- Next Best Action reflects the most urgent unresolved work.
- Attention Queue shows pending decisions.
- Readiness remains visible but does not dominate if complete.
- Recent AI Activity highlights new AI work since the previous visit.
- Recent Activity provides context for what changed.

## Empty Dashboard

An empty Dashboard occurs when there is no profile progress, resume, AI activity, jobs, or applications.

Expected behavior:

- show one clear starting action;
- explain why that action matters;
- avoid empty widget placeholders;
- avoid presenting unavailable future modules as active work.

The empty state should feel like a starting point, not a failure state.

## Fully Configured Dashboard

A fully configured Dashboard occurs when:

- profile is ready;
- active resume exists;
- extraction is completed;
- analysis is completed;
- no AI review is pending;
- no blocking attention items exist.

Expected behavior:

- Next Best Action moves toward reviewing jobs or improving application momentum;
- Candidate Readiness confirms readiness succinctly;
- Attention Queue may disappear or show that nothing needs attention;
- Recommended Jobs becomes more prominent when available;
- Applications Summary appears when applications exist.

## Busy Dashboard

A busy Dashboard occurs when many jobs, AI reviews, applications, and follow-ups exist.

Expected behavior:

- Next Best Action remains singular;
- Attention Queue groups related work;
- sections show only the most relevant items;
- deeper lists require navigation;
- the page avoids becoming an infinite feed.

The busy state should reduce decision fatigue, not expose every pending item at once.

## Offline or API Unavailable

When the API is unavailable, the Dashboard should communicate that live job-search state cannot be loaded.

Expected behavior:

- show a clear unavailable state;
- explain that the local or production API could not be reached;
- avoid displaying stale data as current unless explicitly marked as stale in a future offline-capable version;
- provide a recovery action when supported, such as retry.

The error state should avoid stack traces, internal service details, or blame-oriented language.

## Loading States

The Dashboard should load in a way that preserves hierarchy.

Expected behavior:

- show that the command center is loading;
- preserve the major page structure if possible;
- avoid implying that there are no attention items before data has loaded;
- load high-priority sections first when progressive loading is available.

Loading copy should be concise.

## Error States

Error states should be specific enough to help the user recover.

Examples:

- Candidate profile could not be loaded.
- Resume status could not be loaded.
- AI activity could not be loaded.
- Jobs are temporarily unavailable.
- Applications are temporarily unavailable.

If one lower-priority section fails, the entire Dashboard should not fail when the rest of the data is available. Section-level errors are preferred for non-critical areas.

## Empty States

Empty states should explain the next meaningful action.

Examples:

- No active resume: upload a resume to unlock extraction and AI review.
- No AI activity: AI findings will appear after resume analysis or future job-fit review.
- No recommended jobs: recommendations will appear after job discovery is available and your candidate foundation is ready.
- No applications: applications will appear once you start preparing or tracking job applications.

Empty states should not contain long explanations.

## Progressive Disclosure

## Belongs on the Dashboard

The Dashboard should show:

- one next best action;
- readiness state;
- actionable attention items;
- small number of recommended jobs when available;
- application work requiring attention;
- recent AI work requiring review;
- short recent activity.

## Requires Navigation

The following should require navigation to dedicated pages:

- full profile editing;
- full resume version history;
- extracted resume text;
- parser metadata;
- full AI analysis output;
- AI proposal acceptance workflows;
- full job feed;
- full job detail;
- fit evidence and blocking requirement detail;
- application answer editing;
- submission review;
- automation settings;
- complete activity history.

## Principle

The Dashboard should tell the user what matters and where to go. It should not contain every workflow itself.

## User Experience Rules

The Dashboard should reduce anxiety by making unknowns visible and actionable.

It should reduce decision fatigue by recommending one primary action.

It should increase confidence by showing readiness and evidence-based AI work.

It should encourage progress by framing gaps as next steps, not failures.

It should avoid overwhelming the user by limiting list lengths and routing detail to dedicated pages.

It should never require reading large blocks of text to understand state.

It should treat AI output as assistive and reviewable, never final by default.

## Anti-Patterns

The Dashboard must never become:

- an ERP-style operations console;
- a metrics-first analytics page;
- a CRUD screen;
- a large profile form;
- a resume management page;
- an infinite job feed;
- a widget gallery;
- a generic job board;
- an AI transcript;
- a notification dump;
- a settings overview;
- a public professional profile.

The Dashboard should not expose backend entities as user-facing concepts.

Avoid user-facing labels such as:

- CandidateProfile;
- ResumeExtraction;
- ResumeAnalysis;
- Provider payload;
- Pipeline execution;
- Entity status.

Use workflow language instead.

## Future Compatibility

## Jobs

When Jobs becomes available, Recommended Jobs can evolve from an unavailable or readiness-dependent state into a curated opportunity section.

The Dashboard does not need redesign because the section already reserves a place for high-signal opportunities and routes detail to Jobs.

## Applications

When Applications becomes available, Applications Summary can evolve from absent or explanatory into an active work summary.

The Dashboard does not need redesign because the section is already defined around action states rather than implementation statuses.

## Automation

When automation becomes available, automation should surface only through user-controlled tasks.

Examples:

- application form ready for review;
- unknown questions require answers;
- legal confirmation required;
- submission waiting for explicit approval.

Automation should appear in Attention Queue and Applications Summary, not as an autonomous Dashboard area.

## Interview Preparation

When Interview Preparation becomes available, it should appear through Applications or a future Interview Pipeline area.

Dashboard exposure should be action-oriented:

- prepare for upcoming interview;
- review company research;
- practice likely questions;
- add interview notes.

It should not turn the Dashboard into a calendar or study hub.

## Insights

When Insights becomes available, the Dashboard may show limited insight summaries only when they affect action.

Examples:

- many dismissed jobs share the same salary blocker;
- applications stall when resume is not tailored;
- one source produces low-fit roles.

Deep analytics should live in a dedicated Insights page. The Dashboard should show insights only when they help the user decide what to do next.

## Success Criteria

The Dashboard is successful when another user or developer can understand:

- the user's current job-search state;
- the most important next action;
- what is blocking progress;
- whether the candidate foundation is ready;
- whether AI has prepared anything requiring review;
- whether relevant jobs or applications need attention.

The Dashboard implementation should be considered product-correct when:

- one primary action is clear;
- no section behaves like a generic widget;
- empty states guide progress without fake data;
- AI activity is transparent and review-oriented;
- readiness is state-based rather than a fabricated score;
- future Jobs and Applications modules can be introduced without reorganizing the screen;
- the page feels like a personal AI job-search command center, not an admin panel.
