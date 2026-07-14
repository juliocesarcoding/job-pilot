import type { ReactElement } from 'react';
import type { ResumeAnalysisResponse, ResumeExtractionResponse, ResumeResponse } from '@job-pilot/shared';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { DashboardView } from '../features/dashboard/DashboardView';
import { buildDashboardModel } from '../features/dashboard/dashboard-model';
import { createJobPilotApiClient, getUserFacingApiError, JobPilotApiError } from '../lib/api';

export default async function DashboardPage(): Promise<ReactElement> {
  const api = createJobPilotApiClient();
  const profileResult = await capture(() => api.getCandidateProfile());

  if (!profileResult.ok) {
    return (
      <DashboardShell
        activeItem="Dashboard"
        currentUserLabel={getCurrentDevelopmentUserLabel()}
        attentionCounts={{}}
      >
        <section className="dashboard-unavailable" aria-labelledby="dashboard-unavailable-heading">
          <p className="eyebrow">Dashboard unavailable</p>
          <h1 id="dashboard-unavailable-heading">Live job-search state could not be loaded.</h1>
          <p>{getUserFacingApiError(profileResult.error)}</p>
          <a className="button button--primary" href="/">
            Retry
          </a>
        </section>
      </DashboardShell>
    );
  }

  const resumesResult = await capture(() => api.listResumes());
  const resumes = resumesResult.ok ? resumesResult.value : [];
  const activeResume = resumes.find((resume) => resume.active) ?? null;
  const extractionResult = activeResume ? await optionalRequest(() => api.getResumeExtraction(activeResume.id)) : null;
  const analysisResult = activeResume ? await optionalRequest(() => api.getResumeAnalysis(activeResume.id)) : null;

  const dashboard = buildDashboardModel({
    profile: profileResult.value,
    resumes,
    activeResume,
    extraction: extractionResult?.value ?? null,
    analysis: analysisResult?.value ?? null,
    sectionErrors: {
      resumes: resumesResult.ok ? null : getUserFacingApiError(resumesResult.error),
      extraction: extractionResult?.error ?? null,
      analysis: analysisResult?.error ?? null,
    },
  });

  return (
    <DashboardShell
      activeItem="Dashboard"
      currentUserLabel={getCurrentDevelopmentUserLabel()}
      attentionCounts={dashboard.sidebarAttentionCounts}
    >
      <DashboardView dashboard={dashboard} />
    </DashboardShell>
  );
}

async function capture<T>(request: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  try {
    return { ok: true, value: await request() };
  } catch (error: unknown) {
    return { ok: false, error };
  }
}

async function optionalRequest<T>(
  request: () => Promise<T>,
): Promise<{ value: T | null; error: string | null }> {
  const result = await capture(request);

  if (result.ok) {
    return { value: result.value, error: null };
  }

  if (result.error instanceof JobPilotApiError && result.error.status === 404) {
    return { value: null, error: null };
  }

  return { value: null, error: getUserFacingApiError(result.error) };
}

function getCurrentDevelopmentUserLabel(): string {
  const email = process.env.JOBPILOT_DEV_USER_EMAIL ?? 'julio.dev@jobpilot.local';
  const localPart = email.split('@')[0] ?? 'there';
  const firstName = localPart.split(/[._-]/)[0] ?? localPart;

  return `${firstName.charAt(0).toLocaleUpperCase('en-US')}${firstName.slice(1)}`;
}

export type DashboardResumeState = {
  resumes: ResumeResponse[];
  activeResume: ResumeResponse | null;
  extraction: ResumeExtractionResponse | null;
  analysis: ResumeAnalysisResponse | null;
};
