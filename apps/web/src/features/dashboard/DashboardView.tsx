import React from 'react';
import type { ReactElement } from 'react';
import type { DashboardActivityItem, DashboardModel, ReadinessItem } from './dashboard-model';

export function DashboardView({ dashboard }: { dashboard: DashboardModel }): ReactElement {
  return (
    <main className="dashboard-main">
      <section className="dashboard-hero" aria-labelledby="next-best-action-heading">
        <NextBestActionSection dashboard={dashboard} />
      </section>

      <div className="dashboard-workspace-grid">
        <div className="dashboard-primary-column">
          <PrimaryWorkspaceSection dashboard={dashboard} />
          <AttentionQueueSection items={dashboard.attentionItems} />
          <RecentAiActivitySection items={dashboard.recentAiActivity} error={dashboard.sectionErrors.analysis} />
        </div>
        <aside className="dashboard-support-column" aria-label="Dashboard supporting status">
          <CandidateReadinessSection items={dashboard.readiness} errors={dashboard.sectionErrors} />
          <RecentProgressSection items={dashboard.recentProgress} />
          <FutureCapabilitiesNote dashboard={dashboard} />
        </aside>
      </div>
    </main>
  );
}

function NextBestActionSection({ dashboard }: { dashboard: DashboardModel }): ReactElement {
  return (
    <>
      <div>
        <p className="eyebrow">Next Best Action</p>
        <h2 id="next-best-action-heading">{dashboard.nextBestAction.title}</h2>
        <p>{dashboard.nextBestAction.message}</p>
      </div>
      <a className="button button--primary" href={dashboard.nextBestAction.href}>
        {dashboard.nextBestAction.label}
      </a>
    </>
  );
}

function PrimaryWorkspaceSection({ dashboard }: { dashboard: DashboardModel }): ReactElement {
  const { workspace } = dashboard;

  return (
    <section className="dashboard-workspace" aria-labelledby="resume-workspace-heading">
      <div className="dashboard-workspace-heading">
        <div>
          <p className="eyebrow">Current workspace</p>
          <h2 id="resume-workspace-heading">Resume and AI review</h2>
        </div>
        <a className="button" href="/profile#resume-heading">
          Open Resume
        </a>
      </div>

      <div className="workspace-resume-summary">
        <div>
          <span className="workspace-label">Active resume</span>
          <strong>{workspace.resume.fileName ?? 'No resume uploaded yet'}</strong>
          <small>
            {workspace.resume.version ? `Version ${workspace.resume.version}` : 'Upload a PDF or DOCX to begin.'}
          </small>
        </div>
        <span className="workspace-status">{workspace.resume.statusLabel}</span>
      </div>

      <div className="workflow-steps" aria-label="Resume workflow state">
        <WorkflowStep title="Text extraction" status={workspace.extraction.statusLabel} detail={workspace.extraction.detail} />
        <WorkflowStep title="AI analysis" status={workspace.analysis.statusLabel} detail={workspace.analysis.detail} />
      </div>

      {workspace.analysis.summary ? (
        <div className="analysis-snapshot" aria-label="AI analysis summary">
          <Metric label="Skills identified" value={workspace.analysis.summary.skillsCount} />
          <Metric label="Experience entries" value={workspace.analysis.summary.experienceCount} />
          <Metric label="Languages" value={workspace.analysis.summary.languagesCount} />
          <Metric label="Certifications" value={workspace.analysis.summary.certificationsCount} />
        </div>
      ) : null}

      {workspace.analysis.proposalNotice ? <p className="proposal-note">{workspace.analysis.proposalNotice}</p> : null}
    </section>
  );
}

function WorkflowStep({ title, status, detail }: { title: string; status: string; detail: string }): ReactElement {
  return (
    <article className="workflow-step">
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
      <span>{status}</span>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }): ReactElement {
  return (
    <div className="analysis-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function AttentionQueueSection({ items }: { items: DashboardModel['attentionItems'] }): ReactElement | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="dashboard-section" aria-labelledby="attention-queue-heading">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Needs attention</p>
          <h2 id="attention-queue-heading">Attention Queue</h2>
        </div>
        <span className="dashboard-count">{items.length}</span>
      </div>
      <div className="dashboard-list">
        {items.map((item) => (
          <a key={item.id} className="dashboard-list-item" href={item.href}>
            <strong>{item.title}</strong>
            <span>{item.message}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function CandidateReadinessSection({
  items,
  errors,
}: {
  items: ReadinessItem[];
  errors: DashboardModel['sectionErrors'];
}): ReactElement {
  return (
    <section className="dashboard-section" aria-labelledby="candidate-readiness-heading">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Readiness</p>
          <h2 id="candidate-readiness-heading">Candidate Readiness</h2>
        </div>
      </div>
      {errors.resumes ? <p className="action-message action-message--error">{errors.resumes}</p> : null}
      {errors.extraction ? <p className="action-message action-message--error">{errors.extraction}</p> : null}
      {errors.analysis ? <p className="action-message action-message--error">{errors.analysis}</p> : null}
      <div className="readiness-grid">
        {items.map((item) => (
          <a key={item.key} className="readiness-item" href={item.href}>
            <span
              className={`readiness-status readiness-status--${item.status}`}
              aria-label={`${item.label}: ${formatStatus(item.status)}`}
            >
              {item.status === 'ready' ? 'Ready' : item.status === 'failed' ? 'Failed' : 'Needs action'}
            </span>
            <strong>{item.label}</strong>
            <small>{item.summary}</small>
          </a>
        ))}
      </div>
    </section>
  );
}

function FutureCapabilitiesNote({ dashboard }: { dashboard: DashboardModel }): ReactElement {
  return (
    <section className="future-note" id="jobs-coming-soon" aria-labelledby="future-capabilities-heading">
      <p className="eyebrow">Coming later</p>
      <h2 id="future-capabilities-heading">Jobs and Applications</h2>
      <p>
        {dashboard.recommendedJobs.message} {dashboard.applicationsSummary.message}
      </p>
      <div className="future-note-links" id="applications-coming-soon">
        <span>Jobs: Coming soon</span>
        <span>Applications: Coming soon</span>
      </div>
    </section>
  );
}

function RecentAiActivitySection({
  items,
  error,
}: {
  items: DashboardActivityItem[];
  error: string | null;
}): ReactElement {
  return (
    <section className="dashboard-section" aria-labelledby="recent-ai-activity-heading">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">AI prepared</p>
          <h2 id="recent-ai-activity-heading">Recent AI Activity</h2>
        </div>
      </div>
      {error ? <p className="action-message action-message--error">{error}</p> : null}
      {items.length === 0 ? (
        <div className="dashboard-empty-state">
          <h3>No AI activity yet</h3>
          <p>AI findings will appear after resume analysis or future job-fit review.</p>
        </div>
      ) : (
        <ActivityList items={items} />
      )}
    </section>
  );
}

function RecentProgressSection({ items }: { items: DashboardActivityItem[] }): ReactElement {
  return (
    <section className="dashboard-section" aria-labelledby="recent-progress-heading">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Recent changes</p>
          <h2 id="recent-progress-heading">Recent Progress</h2>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="dashboard-empty-state">
          <h3>No progress recorded yet</h3>
          <p>Recent profile, resume, extraction, and AI review changes will appear here.</p>
        </div>
      ) : (
        <ActivityList items={items} />
      )}
    </section>
  );
}

function ActivityList({ items }: { items: DashboardActivityItem[] }): ReactElement {
  return (
    <div className="dashboard-list">
      {items.map((item) => (
        <a key={item.id} className="dashboard-list-item" href={item.href}>
          <strong>{item.title}</strong>
          <span>{item.message}</span>
          <small>{formatDate(item.occurredAt)}</small>
        </a>
      ))}
    </div>
  );
}

function formatStatus(status: ReadinessItem['status']): string {
  return status
    .split('-')
    .map((part) => `${part.charAt(0).toLocaleUpperCase('en-US')}${part.slice(1)}`)
    .join(' ');
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
