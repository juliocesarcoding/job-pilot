'use client';

import { useActionState, useState, type ReactElement } from 'react';
import type { ResumeAnalysisResponse, ResumeExtractionResponse, ResumeResponse } from '@job-pilot/shared';
import { ActionMessage } from '../../components/ActionMessage';
import { SubmitButton } from '../../components/SubmitButton';
import {
  analyzeResumeAction,
  deleteResumeAction,
  extractResumeAction,
  uploadResumeAction,
  type FormActionState,
} from '../../app/profile/actions';
import { AnalysisSection } from './AnalysisSection';

const initialState: FormActionState = { status: 'idle', message: null };

export function ResumeSection({
  resumes,
  activeResume,
  extraction,
  analysis,
  apiBaseUrl,
  extractionError,
  analysisError,
}: {
  resumes: ResumeResponse[];
  activeResume: ResumeResponse | null;
  extraction: ResumeExtractionResponse | null;
  analysis: ResumeAnalysisResponse | null;
  apiBaseUrl: string;
  extractionError: string | null;
  analysisError: string | null;
}): ReactElement {
  const [uploadState, uploadAction] = useActionState(uploadResumeAction, initialState);
  const [extractState, extractAction] = useActionState(extractResumeAction, initialState);
  const [analyzeState, analyzeAction] = useActionState(analyzeResumeAction, initialState);

  const extractionCompleted = extraction?.status === 'COMPLETED';
  const canExtract = Boolean(activeResume && !extraction);
  const canAnalyze = Boolean(activeResume && extractionCompleted && !analysis);

  return (
    <>
      <section className="panel" aria-labelledby="resume-heading">
        <div className="section-heading">
          <h2 id="resume-heading">Resume</h2>
          <p>Upload versions, download stored files, and run text extraction for the active resume.</p>
        </div>

        <form action={uploadAction} className="upload-row">
          <label className="field">
            <span>Upload PDF or DOCX</span>
            <input
              name="file"
              type="file"
              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.docx"
            />
          </label>
          <SubmitButton pendingLabel="Uploading...">Upload resume</SubmitButton>
          <ActionMessage state={uploadState} />
        </form>

        {activeResume ? (
          <ActiveResumeCard
            resume={activeResume}
            extraction={extraction}
            analysis={analysis}
            apiBaseUrl={apiBaseUrl}
            canExtract={canExtract}
            canAnalyze={canAnalyze}
            extractAction={extractAction}
            analyzeAction={analyzeAction}
            extractState={extractState}
            analyzeState={analyzeState}
          />
        ) : (
          <p className="empty-state">No active resume is available yet.</p>
        )}

        {extractionError ? <p className="action-message action-message--error">{extractionError}</p> : null}
        {analysisError ? <p className="action-message action-message--error">{analysisError}</p> : null}

        <div className="subsection">
          <h3>Version history</h3>
          {resumes.length === 0 ? (
            <p className="empty-state">No resume versions have been uploaded.</p>
          ) : (
            <div className="resume-list">
              {resumes.map((resume) => (
                <ResumeVersionRow key={resume.id} resume={resume} apiBaseUrl={apiBaseUrl} />
              ))}
            </div>
          )}
        </div>
      </section>

      <AnalysisSection analysis={analysis} />
    </>
  );
}

function ActiveResumeCard({
  resume,
  extraction,
  analysis,
  apiBaseUrl,
  canExtract,
  canAnalyze,
  extractAction,
  analyzeAction,
  extractState,
  analyzeState,
}: {
  resume: ResumeResponse;
  extraction: ResumeExtractionResponse | null;
  analysis: ResumeAnalysisResponse | null;
  apiBaseUrl: string;
  canExtract: boolean;
  canAnalyze: boolean;
  extractAction: (formData: FormData) => void;
  analyzeAction: (formData: FormData) => void;
  extractState: FormActionState;
  analyzeState: FormActionState;
}): ReactElement {
  return (
    <article className="record record--highlight">
      <div className="record-heading">
        <div>
          <h3>{resume.originalFileName}</h3>
          <p>
            Version {resume.version} · {resume.mimeType} · {formatBytes(resume.fileSize)}
          </p>
        </div>
        <span className="status-pill">Active</span>
      </div>

      <dl className="metadata-grid">
        <div>
          <dt>Uploaded</dt>
          <dd>{formatDateTime(resume.uploadedAt)}</dd>
        </div>
        <div>
          <dt>Extraction</dt>
          <dd>{extraction?.status ?? 'Not started'}</dd>
        </div>
        <div>
          <dt>Analysis</dt>
          <dd>{analysis?.status ?? 'Not started'}</dd>
        </div>
      </dl>

      <div className="button-row">
        <a className="button" href={`${apiBaseUrl}/resumes/${resume.id}/download`}>
          Download resume
        </a>
        <form action={extractAction}>
          <input type="hidden" name="resumeId" value={resume.id} />
          <SubmitButton pendingLabel="Extracting..." disabled={!canExtract}>
            Extract resume text
          </SubmitButton>
        </form>
        <form action={analyzeAction}>
          <input type="hidden" name="resumeId" value={resume.id} />
          <SubmitButton pendingLabel="Analyzing..." disabled={!canAnalyze}>
            Analyze resume
          </SubmitButton>
        </form>
      </div>

      <ActionMessage state={extractState} />
      <ActionMessage state={analyzeState} />
    </article>
  );
}

function ResumeVersionRow({ resume, apiBaseUrl }: { resume: ResumeResponse; apiBaseUrl: string }): ReactElement {
  const [deleteState, deleteAction] = useActionState(deleteResumeAction, initialState);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <details className="record record--collapsible">
      <summary className="record-summary">
        <div>
          <h3>{resume.originalFileName}</h3>
          <p>
            Version {resume.version} · {formatBytes(resume.fileSize)} · {formatDateTime(resume.uploadedAt)}
          </p>
        </div>
        <span className="status-pill">{resume.active ? 'Active' : 'Previous'}</span>
      </summary>
      <div className="record-body">
        <div className="button-row">
          <a className="button" href={`${apiBaseUrl}/resumes/${resume.id}/download`}>
            Download
          </a>
          <form action={deleteAction} className="delete-row">
            <input type="hidden" name="resumeId" value={resume.id} />
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={confirmDelete}
                onChange={(event) => setConfirmDelete(event.target.checked)}
              />
              <span>Confirm deletion</span>
            </label>
            <SubmitButton pendingLabel="Deleting..." disabled={!confirmDelete}>
              Delete version
            </SubmitButton>
          </form>
        </div>
        <ActionMessage state={deleteState} />
      </div>
    </details>
  );
}

function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
