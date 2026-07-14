import type { ReactElement } from 'react';
import type {
  CandidateProfileResponse,
  ResumeAnalysisResponse,
  ResumeExtractionResponse,
  ResumeResponse,
} from '@job-pilot/shared';
import { ProfileSection } from '../../features/candidate-profile/ProfileSection';
import { ExperiencesSection } from '../../features/candidate-profile/ExperiencesSection';
import { SkillsSection } from '../../features/candidate-profile/SkillsSection';
import { ResumeSection } from '../../features/resume/ResumeSection';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { JobPilotApiError, createJobPilotApiClient, getApiBaseUrl, getUserFacingApiError } from '../../lib/api';

export default async function ProfilePage(): Promise<ReactElement> {
  const api = createJobPilotApiClient();
  const apiBaseUrl = getApiBaseUrl();

  try {
    const [profile, resumes] = await Promise.all([api.getCandidateProfile(), safeListResumes()]);
    const activeResume = await getActiveResume(resumes);
    const extraction = activeResume
      ? await optionalRequest(() => api.getResumeExtraction(activeResume.id))
      : emptyOptional<ResumeExtractionResponse>();
    const analysis = activeResume
      ? await optionalRequest(() => api.getResumeAnalysis(activeResume.id))
      : emptyOptional<ResumeAnalysisResponse>();

    return (
      <DashboardShell
        activeItem="Profile"
        currentUserLabel={getCurrentDevelopmentUserLabel()}
        attentionCounts={{}}
        headerEyebrow="Candidate workspace"
        title="Profile"
        description="Maintain the trusted profile, resume, and AI review state JobPilot uses to help with applications."
        headerActions={
          <>
            <a className="button" href="#resume-heading">
              Resume
            </a>
            <a className="button" href="#analysis-heading">
              AI Review
            </a>
          </>
        }
      >
        <main className="page-shell">
          <div className="workspace-grid">
            <div className="workspace-column">
              <ProfileOverview profile={profile} />
              <ProfileSection profile={profile} />
              <ExperiencesSection experiences={profile.experiences} />
              <SkillsSection skills={profile.skills} />
            </div>
            <div className="workspace-column">
              <ResumeSection
                resumes={resumes}
                activeResume={activeResume}
                extraction={extraction.value}
                analysis={analysis.value}
                apiBaseUrl={apiBaseUrl}
                extractionError={extraction.error}
                analysisError={analysis.error}
              />
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  } catch (error: unknown) {
    return (
      <DashboardShell
        activeItem="Profile"
        currentUserLabel={getCurrentDevelopmentUserLabel()}
        attentionCounts={{}}
        headerEyebrow="Candidate workspace"
        title="Profile"
        description="Maintain the trusted profile, resume, and AI review state JobPilot uses to help with applications."
        headerActions={null}
      >
        <main className="page-shell">
          <section className="panel panel--error">
            <h1>Profile workspace unavailable</h1>
            <p>{getUserFacingApiError(error)}</p>
          </section>
        </main>
      </DashboardShell>
    );
  }
}

async function safeListResumes(): Promise<ResumeResponse[]> {
  try {
    return await createJobPilotApiClient().listResumes();
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return [];
    }

    throw error;
  }
}

async function getActiveResume(resumes: ResumeResponse[]): Promise<ResumeResponse | null> {
  return resumes.find((resume) => resume.active) ?? null;
}

async function optionalRequest<T>(
  request: () => Promise<T>,
): Promise<{ value: T | null; error: string | null }> {
  try {
    return { value: await request(), error: null };
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return { value: null, error: null };
    }

    return { value: null, error: getUserFacingApiError(error) };
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof JobPilotApiError && error.status === 404;
}

function emptyOptional<T>(): { value: T | null; error: string | null } {
  return { value: null, error: null };
}

function getCurrentDevelopmentUserLabel(): string {
  const email = process.env.JOBPILOT_DEV_USER_EMAIL ?? 'julio.dev@jobpilot.local';
  const localPart = email.split('@')[0] ?? 'there';
  const firstName = localPart.split(/[._-]/)[0] ?? localPart;

  return `${firstName.charAt(0).toLocaleUpperCase('en-US')}${firstName.slice(1)}`;
}

function ProfileOverview({ profile }: { profile: CandidateProfileResponse }): ReactElement {
  const completedBasics = [
    profile.headline,
    profile.summary,
    profile.currentLocation,
    profile.desiredRole,
    profile.englishLevel,
  ].filter(Boolean).length;
  const totalBasics = 5;
  const primarySkills = profile.skills.filter((skill) => skill.isPrimary).length;

  return (
    <section className="profile-overview panel" aria-labelledby="profile-overview-heading">
      <div>
        <p className="eyebrow">Trusted candidate source</p>
        <h2 id="profile-overview-heading">{profile.desiredRole ?? profile.headline ?? 'Profile foundation'}</h2>
        <p>
          {profile.headline ??
            'Keep this area concise and verified so matching, resume review, and application help stay grounded.'}
        </p>
      </div>
      <dl className="profile-overview-stats" aria-label="Profile snapshot">
        <div>
          <dt>Basics</dt>
          <dd>
            {completedBasics}/{totalBasics}
          </dd>
        </div>
        <div>
          <dt>Experience</dt>
          <dd>{profile.experiences.length}</dd>
        </div>
        <div>
          <dt>Skills</dt>
          <dd>{profile.skills.length}</dd>
        </div>
        <div>
          <dt>Primary</dt>
          <dd>{primarySkills}</dd>
        </div>
      </dl>
    </section>
  );
}
