# Sitemap

## Current Product Areas

### Dashboard

- Dashboard
  - Next recommended action
  - Readiness summary
  - Opportunities requiring attention
  - Applications requiring attention
  - Recent AI findings
  - Recent activity

### Profile

- Profile
  - Overview
  - Experience
    - Add experience
    - Edit experience
    - Delete experience
  - Skills
    - Add skill
    - Edit candidate skill metadata
    - Delete candidate skill
  - Preferences
    - Desired role
    - Work arrangement
    - Compensation expectations
    - Location and visa constraints
  - Links
    - LinkedIn
    - GitHub
    - Portfolio

### Resume

- Resume
  - Active resume
    - Upload resume
    - Download resume
    - Delete resume version
  - Version history
    - Resume version detail
  - Text extraction
    - Extraction status
    - Extraction result
    - Extraction failure detail
  - Resume analysis
    - Analysis status
    - Analysis result
    - Provider metadata
    - Token usage

### AI Review

- AI Review
  - Resume findings
    - Summary proposal
    - Skills proposal
    - Experience proposal
    - Education proposal
    - Languages proposal
    - Certifications proposal
  - Profile update proposals
  - Job-fit explanations
  - Application answer drafts
  - Review history

### Jobs

- Jobs
  - Recommended jobs
  - Saved jobs
  - Dismissed jobs
  - Job detail
    - Job summary
    - Fit analysis
    - Positive matches
    - Gaps
    - Blocking requirements
    - Source information
  - Search criteria
  - Sources

### Applications

- Applications
  - Needs attention
  - Drafting
  - Ready to submit
  - Submitted
  - Archived
  - Application detail
    - Job context
    - Resume version used
    - Generated materials
    - Application questions
    - User-required answers
    - Status history
    - Follow-up reminders

### Settings

- Settings
  - Account
  - Integrations
    - LinkedIn
    - GitHub
    - Job sources
    - AI provider
  - Privacy
    - Data visibility
    - Resume storage
    - Sensitive data handling
  - Notifications
  - Automation preferences
    - Form filling review rules
    - Submission confirmation rules
    - Legal statement confirmation rules

## Future Pages

Future pages may be introduced as the product matures:

- Resume Builder
  - Tailored resume draft
  - Resume comparison
  - Resume change review
- Cover Letters
  - Drafts
  - Review
  - Version history
- Application Questions Library
  - Reusable answers
  - Unknown questions
  - Sensitive questions
- Job Source Management
  - Source configuration
  - Collection status
  - Source errors
- Interview Pipeline
  - Interview stages
  - Preparation notes
  - Company research
- Insights
  - Application conversion
  - Resume effectiveness
  - Job-source quality
  - Common blockers
- Data Export
  - Resume export
  - Application history export
  - Candidate profile export

## Sitemap Principles

The sitemap should remain workflow-oriented.

Pages should be added when they represent a durable user job, not merely because a backend entity exists. For example, `ResumeExtraction` is not a primary navigation item. It belongs inside Resume because it is part of preparing the resume for analysis and downstream workflows.

Similarly, AI Review is a primary area because user judgment is central to the product. AI-generated findings can come from multiple workflows, and the user needs one reliable place to review proposed changes before they affect applications or profile data.
