# Dashboard Concept

## Purpose

The Dashboard is the user's job-search command center.

It should not start from metrics or widgets. It should start from the user's situation: they are trying to get interviews while managing profile quality, resume readiness, job discovery, application preparation, and follow-up work.

The Dashboard should answer:

- What should I do next?
- How close am I to being ready to apply?
- Which opportunities require my attention?
- Which applications are blocked by missing information?
- Has AI found something I should review?
- Are there jobs I should ignore because they are clearly incompatible?
- Am I making progress toward interviews?

The Dashboard exists to reduce uncertainty and keep momentum.

## Primary Dashboard Question

The primary question is:

What is the most valuable next action?

This action should be based on the current state of the user's job-search system. Examples:

- Complete missing profile fields that block matching.
- Review resume analysis before applying.
- Analyze a newly uploaded resume.
- Review high-fit jobs found recently.
- Answer missing application questions.
- Follow up on submitted applications.

The Dashboard should not ask the user to browse everything. It should point them to the next high-leverage task.

## Secondary Dashboard Questions

### How Ready Is My Candidate Foundation?

The Dashboard should communicate whether the profile and resume are ready for job matching and application generation.

This includes:

- profile completeness;
- resume availability;
- extraction status;
- AI analysis status;
- unresolved AI review items;
- missing critical preferences.

The goal is not to create a vanity completion score. The goal is to show whether the system has enough trusted information to help the user effectively.

### What Requires My Attention?

The Dashboard should separate user-required decisions from passive information.

Attention should be reserved for:

- AI findings awaiting review;
- application questions that need user input;
- jobs with strong fit but unresolved blockers;
- failed resume extraction or analysis;
- applications requiring follow-up;
- missing information that prevents useful automation.

### Which Opportunities Are Worth Reviewing?

When job discovery exists, the Dashboard should surface opportunities that are likely to matter.

It should not show a generic feed. It should prioritize jobs based on relevance, fit, blockers, recency, and user preferences.

### Where Am I in the Application Process?

The Dashboard should show the state of active applications in a way that helps the user act.

Useful states include:

- drafting;
- waiting for user input;
- ready for review;
- submitted;
- follow-up due;
- archived.

The Dashboard should emphasize applications that need the user's attention now.

### What Did AI Do For Me?

The Dashboard should make AI assistance visible without making AI feel autonomous.

Examples:

- AI analyzed the active resume and found missing evidence for leadership impact.
- AI identified three jobs with strong alignment.
- AI drafted answers for two applications pending review.
- AI flagged a role as likely incompatible because of location restrictions.

AI activity should always connect to a user decision or next action.

## Dashboard Widgets

Widgets should be defined only after the Dashboard questions are clear.

### Next Best Action

Answers: What should I do next?

This should be the most prominent Dashboard section. It should contain one recommended action and a short reason.

Examples:

- Review resume analysis because the active resume has new AI findings.
- Complete compensation preferences because job filtering cannot evaluate salary alignment.
- Review five high-fit jobs found today.

### Readiness Summary

Answers: How close am I to applying?

This should summarize whether the candidate foundation is usable for matching and applications.

It may include:

- profile readiness;
- active resume status;
- extraction status;
- analysis status;
- unresolved review count.

### Attention Queue

Answers: What requires my attention?

This should collect actionable items across the product:

- AI review items;
- failed extraction or analysis;
- missing application answers;
- applications ready for final review;
- follow-ups due.

### Recommended Opportunities

Answers: Which opportunities are worth reviewing?

This should show a small set of high-signal jobs, not a broad feed. Each opportunity should explain why it appears.

Useful information:

- role;
- company;
- fit summary;
- blockers;
- salary or location relevance when known;
- source freshness.

### Application Pipeline Summary

Answers: Where am I in the application process?

This should summarize active applications by action state, not only status.

Useful groups:

- needs input;
- ready to submit;
- submitted;
- follow-up due.

### Recent AI Findings

Answers: What did AI do for me?

This should show recent AI-generated proposals or warnings that still require review.

It should not present AI output as accepted truth.

### Recent Activity

Answers: What changed recently?

This should provide operational memory:

- resume uploaded;
- extraction completed;
- analysis failed;
- job saved;
- application moved to submitted;
- AI proposal reviewed.

## Dashboard Prioritization

The Dashboard should prioritize action over observation.

Recommended order:

1. Next Best Action
2. Attention Queue
3. Readiness Summary
4. Recommended Opportunities
5. Application Pipeline Summary
6. Recent AI Findings
7. Recent Activity

This order keeps the user focused on progress.

## Dashboard Non-Goals

The Dashboard should not be:

- a metrics-heavy analytics page;
- a generic job feed;
- a profile editor;
- a resume management page;
- an AI transcript;
- a settings summary.

The Dashboard should orient the user and direct them to the right workflow.

## Success Criteria

The Dashboard succeeds when the user can answer within a short scan:

- what matters now;
- why it matters;
- what action to take;
- what is blocked;
- what AI has prepared for review.

The emotional outcome should be momentum. The user should feel that JobPilot is actively helping them move toward interviews.
