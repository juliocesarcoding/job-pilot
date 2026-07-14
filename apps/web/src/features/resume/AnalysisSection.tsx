import type { ReactElement, ReactNode } from 'react';
import type { ResumeAnalysisResponse } from '@job-pilot/shared';
import { toResumeAnalysisViewModel } from './analysis-view';

export function AnalysisSection({ analysis }: { analysis: ResumeAnalysisResponse | null }): ReactElement {
  const viewModel = analysis?.status === 'COMPLETED' ? toResumeAnalysisViewModel(analysis.analysis) : null;

  return (
    <section className="panel" aria-labelledby="analysis-heading">
      <div className="section-heading">
        <h2 id="analysis-heading">AI Analysis</h2>
        <p>
          This is an AI-generated proposal. The candidate profile has not been modified, and the user must review the
          information.
        </p>
      </div>

      {!analysis ? <p className="empty-state">No AI analysis has been created yet.</p> : null}

      {analysis?.status === 'FAILED' ? (
        <p className="action-message action-message--error">
          Analysis failed. {analysis.errorMessage ? `Saved detail: ${analysis.errorMessage}` : ''}
        </p>
      ) : null}

      {analysis && analysis.status !== 'FAILED' ? (
        <dl className="metadata-grid">
          <div>
            <dt>Status</dt>
            <dd>{analysis.status}</dd>
          </div>
          <div>
            <dt>Provider</dt>
            <dd>{analysis.provider}</dd>
          </div>
          <div>
            <dt>Model</dt>
            <dd>{analysis.model}</dd>
          </div>
          <div>
            <dt>Prompt version</dt>
            <dd>{analysis.promptVersion}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>{formatNullableNumber(analysis.confidence)}</dd>
          </div>
          <div>
            <dt>Token usage</dt>
            <dd>{formatTokens(analysis.inputTokens, analysis.outputTokens, analysis.totalTokens)}</dd>
          </div>
        </dl>
      ) : null}

      {analysis?.status === 'COMPLETED' && !viewModel ? (
        <p className="action-message action-message--error">The saved AI analysis could not be displayed.</p>
      ) : null}

      {viewModel ? (
        <>
          <dl className="analysis-snapshot-grid" aria-label="AI analysis findings summary">
            <SnapshotMetric label="Skills" value={viewModel.skills.length} />
            <SnapshotMetric label="Experience" value={viewModel.experience.length} />
            <SnapshotMetric label="Education" value={viewModel.education.length} />
            <SnapshotMetric label="Languages" value={viewModel.languages.length} />
            <SnapshotMetric label="Certifications" value={viewModel.certifications.length} />
          </dl>

          <div className="analysis-grid">
            <AnalysisCard title="Summary">
              <p>{viewModel.summary.headline ?? 'No headline proposed.'}</p>
              <p>{viewModel.summary.overview ?? 'No overview proposed.'}</p>
              <p>{viewModel.summary.seniority ?? 'No seniority proposed.'}</p>
            </AnalysisCard>

            <ListCard
              title="Skills"
              items={viewModel.skills}
              renderItem={(item) => (
                <>
                  <strong>{item.name}</strong>
                  <span>{item.category ?? 'No category'}</span>
                  <small>{item.evidence ?? 'No evidence captured.'}</small>
                </>
              )}
            />

            <ListCard
              title="Experience"
              items={viewModel.experience}
              renderItem={(item) => (
                <>
                  <strong>{item.role ?? 'Unknown role'}</strong>
                  <span>{item.company ?? 'Unknown company'}</span>
                  <small>{item.evidence ?? item.description ?? 'No evidence captured.'}</small>
                </>
              )}
            />

            <ListCard
              title="Education"
              items={viewModel.education}
              renderItem={(item) => (
                <>
                  <strong>{item.degree ?? 'Unknown degree'}</strong>
                  <span>{item.institution ?? 'Unknown institution'}</span>
                  <small>{item.evidence ?? item.field ?? 'No evidence captured.'}</small>
                </>
              )}
            />

            <ListCard
              title="Languages"
              items={viewModel.languages}
              renderItem={(item) => (
                <>
                  <strong>{item.name}</strong>
                  <span>{item.proficiency ?? 'No proficiency captured'}</span>
                  <small>{item.evidence ?? 'No evidence captured.'}</small>
                </>
              )}
            />

            <ListCard
              title="Certifications"
              items={viewModel.certifications}
              renderItem={(item) => (
                <>
                  <strong>{item.name}</strong>
                  <span>{item.issuer ?? 'No issuer captured'}</span>
                  <small>{item.evidence ?? 'No evidence captured.'}</small>
                </>
              )}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}

function SnapshotMetric({ label, value }: { label: string; value: number }): ReactElement {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function AnalysisCard({ title, children }: { title: string; children: ReactNode }): ReactElement {
  return (
    <article className="analysis-card">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function ListCard<T>({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: T[];
  renderItem: (item: T) => ReactElement;
}): ReactElement {
  return (
    <details className="analysis-card analysis-card--collapsible">
      <summary className="analysis-card-summary">
        <div>
          <h3>{title}</h3>
          <p>{items.length === 0 ? 'No items captured.' : 'Review AI-proposed findings.'}</p>
        </div>
        <span className="status-pill">{items.length}</span>
      </summary>
      <div className="analysis-card-body">
        {items.length === 0 ? (
          <p>No items captured.</p>
        ) : (
          <ul className="analysis-list">
            {items.map((item, index) => (
              <li key={index}>{renderItem(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

function formatNullableNumber(value: number | null): string {
  return value === null ? 'Not available' : value.toString();
}

function formatTokens(input: number | null, output: number | null, total: number | null): string {
  if (input === null && output === null && total === null) {
    return 'Not available';
  }

  return `input ${input ?? 0}, output ${output ?? 0}, total ${total ?? 0}`;
}
