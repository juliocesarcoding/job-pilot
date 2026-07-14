import type {
  CandidateProfileResponse,
  ResumeAnalysisResponse,
  ResumeExtractionResponse,
  ResumeResponse,
} from '@job-pilot/shared';
import type { DashboardNavItemName } from '../../components/dashboard/DashboardShell';

export type ReadinessStatus = 'ready' | 'needs-action' | 'failed';

export interface ReadinessItem {
  key: 'profile' | 'resume' | 'extraction' | 'analysis';
  label: string;
  status: ReadinessStatus;
  summary: string;
  actionLabel: string;
  href: string;
}

export interface DashboardAction {
  id: string;
  title: string;
  message: string;
  label: string;
  href: string;
}

export interface AttentionItem {
  id: string;
  title: string;
  message: string;
  href: string;
  priority: number;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  message: string;
  occurredAt: string;
  href: string;
}

export interface DashboardModel {
  nextBestAction: DashboardAction;
  workspace: DashboardWorkspace;
  readiness: ReadinessItem[];
  attentionItems: AttentionItem[];
  recommendedJobs: {
    state: 'not-available' | 'waiting-for-profile' | 'waiting-for-resume';
    title: string;
    message: string;
    actionLabel: string;
    href: string;
  };
  applicationsSummary: {
    title: string;
    message: string;
  };
  recentAiActivity: DashboardActivityItem[];
  recentProgress: DashboardActivityItem[];
  sectionErrors: {
    resumes: string | null;
    extraction: string | null;
    analysis: string | null;
  };
  sidebarAttentionCounts: Partial<Record<DashboardNavItemName, number>>;
}

export interface DashboardWorkspace {
  resume: {
    fileName: string | null;
    version: number | null;
    uploadedAt: string | null;
    statusLabel: string;
  };
  extraction: {
    statusLabel: string;
    detail: string;
  };
  analysis: {
    statusLabel: string;
    detail: string;
    proposalNotice: string | null;
    summary: DashboardAnalysisSummary | null;
  };
}

export interface DashboardAnalysisSummary {
  skillsCount: number;
  experienceCount: number;
  languagesCount: number;
  certificationsCount: number;
}

export interface BuildDashboardModelInput {
  profile: CandidateProfileResponse;
  resumes: ResumeResponse[];
  activeResume: ResumeResponse | null;
  extraction: ResumeExtractionResponse | null;
  analysis: ResumeAnalysisResponse | null;
  sectionErrors: {
    resumes: string | null;
    extraction: string | null;
    analysis: string | null;
  };
}

export function buildDashboardModel(input: BuildDashboardModelInput): DashboardModel {
  const readiness = buildReadiness(input);
  const allAttentionItems = buildAttentionItems(input, readiness);
  const nextBestAction = buildNextBestAction(input, readiness);
  const attentionItems = allAttentionItems
    .filter((item) => item.id !== nextBestAction.id)
    .sort((left, right) => left.priority - right.priority);
  const aiReviewCount = countAiReviewItems(input);
  const attentionCount = attentionItems.length + (allAttentionItems.some((item) => item.id === nextBestAction.id) ? 1 : 0);

  return {
    nextBestAction,
    workspace: buildWorkspace(input),
    readiness,
    attentionItems,
    recommendedJobs: buildRecommendedJobs(readiness),
    applicationsSummary: {
      title: 'Applications are not active yet',
      message:
        'Tracked applications will appear here once you start preparing or managing applications in JobPilot.',
    },
    recentAiActivity: buildRecentAiActivity(input),
    recentProgress: buildRecentProgress(input),
    sectionErrors: input.sectionErrors,
    sidebarAttentionCounts: {
      Dashboard: attentionCount,
      'AI Review': aiReviewCount,
      Profile: readiness.find((item) => item.key === 'profile')?.status === 'ready' ? 0 : 1,
      Resume: readiness.some((item) => item.key !== 'profile' && item.status !== 'ready') ? 1 : 0,
    },
  };
}

function buildWorkspace(input: BuildDashboardModelInput): DashboardWorkspace {
  return {
    resume: {
      fileName: input.activeResume?.originalFileName ?? null,
      version: input.activeResume?.version ?? null,
      uploadedAt: input.activeResume?.uploadedAt ?? null,
      statusLabel: input.activeResume ? 'Active resume ready' : 'No active resume',
    },
    extraction: {
      statusLabel: input.extraction?.status ? formatWorkflowStatus(input.extraction.status) : 'Not started',
      detail: getExtractionSummary(input.activeResume, input.extraction),
    },
    analysis: {
      statusLabel: input.analysis?.status ? formatWorkflowStatus(input.analysis.status) : 'Not started',
      detail: getAnalysisSummary(input.extraction, input.analysis),
      proposalNotice:
        input.analysis?.status === 'COMPLETED'
          ? 'AI findings are proposals only. Your candidate profile has not been changed.'
          : null,
      summary: input.analysis?.status === 'COMPLETED' ? getAnalysisSummaryCounts(input.analysis.analysis) : null,
    },
  };
}

function buildReadiness(input: BuildDashboardModelInput): ReadinessItem[] {
  const profileReady = isProfileReady(input.profile);
  const resumeReady = Boolean(input.activeResume);
  const extractionReady = input.extraction?.status === 'COMPLETED';
  const analysisReady = input.analysis?.status === 'COMPLETED';

  return [
    {
      key: 'profile',
      label: 'Profile',
      status: profileReady ? 'ready' : 'needs-action',
      summary: profileReady
        ? 'Candidate foundation is ready for matching and generated material.'
        : 'Complete core profile details so JobPilot can evaluate fit without guessing.',
      actionLabel: profileReady ? 'Open Profile' : 'Complete profile basics',
      href: '/profile',
    },
    {
      key: 'resume',
      label: 'Resume',
      status: resumeReady ? 'ready' : 'needs-action',
      summary: resumeReady
        ? `Active resume: ${input.activeResume?.originalFileName ?? 'uploaded resume'}.`
        : 'Upload a resume to unlock extraction and AI review.',
      actionLabel: resumeReady ? 'Open Resume' : 'Upload resume',
      href: '/profile#resume-heading',
    },
    {
      key: 'extraction',
      label: 'Resume extraction',
      status: input.extraction?.status === 'FAILED' ? 'failed' : extractionReady ? 'ready' : 'needs-action',
      summary: getExtractionSummary(input.activeResume, input.extraction),
      actionLabel: extractionReady ? 'View extraction' : 'Extract resume text',
      href: '/profile#resume-heading',
    },
    {
      key: 'analysis',
      label: 'AI review',
      status: input.analysis?.status === 'FAILED' ? 'failed' : analysisReady ? 'ready' : 'needs-action',
      summary: getAnalysisSummary(input.extraction, input.analysis),
      actionLabel: analysisReady ? 'Review AI findings' : 'Analyze resume',
      href: '/profile#analysis-heading',
    },
  ];
}

function buildNextBestAction(input: BuildDashboardModelInput, readiness: ReadinessItem[]): DashboardAction {
  const profile = readiness.find((item) => item.key === 'profile');
  const resume = readiness.find((item) => item.key === 'resume');
  const extraction = readiness.find((item) => item.key === 'extraction');
  const analysis = readiness.find((item) => item.key === 'analysis');

  if (input.extraction?.status === 'FAILED') {
    return {
      id: 'extraction-failed',
      title: 'Review resume extraction issue',
      message: 'Text extraction failed, so AI cannot reliably analyze this resume yet.',
      label: 'Open resume workflow',
      href: '/profile#resume-heading',
    };
  }

  if (input.analysis?.status === 'FAILED') {
    return {
      id: 'analysis-failed',
      title: 'Review AI analysis issue',
      message: 'AI analysis failed. Check the saved analysis details before continuing.',
      label: 'Open AI Review',
      href: '/profile#analysis-heading',
    };
  }

  if (profile?.status !== 'ready') {
    return {
      id: 'profile-incomplete',
      title: 'Complete profile basics',
      message: 'Your profile needs verified career details before JobPilot can help with matching.',
      label: 'Complete profile basics',
      href: '/profile',
    };
  }

  if (resume?.status !== 'ready') {
    return {
      id: 'resume-missing',
      title: 'Upload your active resume',
      message: 'A resume unlocks extraction, AI review, and future application preparation.',
      label: 'Upload resume',
      href: '/profile#resume-heading',
    };
  }

  if (extraction?.status !== 'ready') {
    return {
      id: 'extraction-missing',
      title: 'Extract resume text',
      message: 'Your resume is uploaded. Extract its text so AI can review the content.',
      label: 'Extract resume text',
      href: '/profile#resume-heading',
    };
  }

  if (analysis?.status !== 'ready') {
    return {
      id: 'analysis-missing',
      title: 'Analyze your resume',
      message: 'Your resume text is ready. Analyze it to identify resume and profile gaps.',
      label: 'Analyze resume',
      href: '/profile#resume-heading',
    };
  }

  return {
    id: 'ai-review-pending',
    title: 'Review AI resume findings',
    message: 'AI prepared resume insights for review. They are suggestions until you accept them in a future workflow.',
    label: 'Review AI findings',
    href: '/profile#analysis-heading',
  };
}

function buildAttentionItems(input: BuildDashboardModelInput, readiness: ReadinessItem[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (readiness.find((item) => item.key === 'profile')?.status !== 'ready') {
    items.push({
      id: 'profile-incomplete',
      title: 'Profile needs verified career details',
      message: 'Missing profile information limits matching and generated application material.',
      href: '/profile',
      priority: 50,
    });
  }

  if (!input.activeResume) {
    items.push({
      id: 'resume-missing',
      title: 'No active resume',
      message: 'Upload a resume to unlock extraction and AI review.',
      href: '/profile#resume-heading',
      priority: 60,
    });
  }

  if (input.activeResume && !input.extraction) {
    items.push({
      id: 'extraction-missing',
      title: 'Resume text has not been extracted',
      message: 'Extract resume text before running AI analysis.',
      href: '/profile#resume-heading',
      priority: 55,
    });
  }

  if (input.extraction?.status === 'FAILED') {
    items.push({
      id: 'extraction-failed',
      title: 'Resume extraction failed',
      message: 'AI cannot analyze this resume until extraction is resolved.',
      href: '/profile#resume-heading',
      priority: 30,
    });
  }

  if (input.extraction?.status === 'COMPLETED' && !input.analysis) {
    items.push({
      id: 'analysis-missing',
      title: 'Resume is ready for AI analysis',
      message: 'Analyze the completed extraction to surface resume findings.',
      href: '/profile#resume-heading',
      priority: 45,
    });
  }

  if (input.analysis?.status === 'FAILED') {
    items.push({
      id: 'analysis-failed',
      title: 'AI analysis failed',
      message: 'Review the saved analysis state before trying a new workflow.',
      href: '/profile#analysis-heading',
      priority: 35,
    });
  }

  if (input.analysis?.status === 'COMPLETED') {
    items.push({
      id: 'ai-review-pending',
      title: 'AI resume findings need review',
      message: 'AI findings are proposals and have not changed the candidate profile.',
      href: '/profile#analysis-heading',
      priority: 40,
    });
  }

  return items;
}

function buildRecommendedJobs(readiness: ReadinessItem[]): DashboardModel['recommendedJobs'] {
  const profileReady = readiness.find((item) => item.key === 'profile')?.status === 'ready';
  const resumeReady = readiness.find((item) => item.key === 'resume')?.status === 'ready';

  if (!profileReady) {
    return {
      state: 'waiting-for-profile',
      title: 'Job recommendations need profile context',
      message: 'Recommendations will appear after job discovery is available and your candidate profile is ready.',
      actionLabel: 'Complete profile basics',
      href: '/profile',
    };
  }

  if (!resumeReady) {
    return {
      state: 'waiting-for-resume',
      title: 'Job recommendations need an active resume',
      message: 'Recommendations will appear after job discovery is available and your resume workflow is ready.',
      actionLabel: 'Upload resume',
      href: '/profile#resume-heading',
    };
  }

  return {
    state: 'not-available',
    title: 'Job discovery is coming later',
    message: 'No fake jobs are shown here. Recommended roles will appear once job discovery is implemented.',
    actionLabel: 'View profile readiness',
    href: '/profile',
  };
}

function buildRecentAiActivity(input: BuildDashboardModelInput): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [];

  if (input.analysis?.status === 'COMPLETED') {
    items.push({
      id: 'analysis-completed',
      title: 'Resume analysis completed',
      message: 'AI prepared structured resume findings for review. The profile was not modified.',
      occurredAt: input.analysis.finishedAt ?? input.analysis.updatedAt,
      href: '/profile#analysis-heading',
    });
    items.push({
      id: 'ai-review-pending',
      title: 'Resume findings awaiting review',
      message: 'Treat the findings as AI proposals until you review them.',
      occurredAt: input.analysis.updatedAt,
      href: '/profile#analysis-heading',
    });
  }

  if (input.analysis?.status === 'FAILED') {
    items.push({
      id: 'analysis-failed',
      title: 'Resume analysis failed',
      message: input.analysis.errorMessage ?? 'AI analysis failed without exposing internal details.',
      occurredAt: input.analysis.finishedAt ?? input.analysis.updatedAt,
      href: '/profile#analysis-heading',
    });
  }

  return sortActivities(items).slice(0, 3);
}

function buildRecentProgress(input: BuildDashboardModelInput): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [
    {
      id: 'profile-updated',
      title: 'Profile updated',
      message: 'Candidate profile foundation changed.',
      occurredAt: input.profile.updatedAt,
      href: '/profile',
    },
  ];

  if (input.activeResume) {
    items.push({
      id: 'resume-uploaded',
      title: 'Resume uploaded',
      message: `${input.activeResume.originalFileName} is the active resume.`,
      occurredAt: input.activeResume.uploadedAt,
      href: '/profile#resume-heading',
    });
  }

  if (input.extraction) {
    items.push({
      id: `extraction-${input.extraction.status.toLocaleLowerCase('en-US')}`,
      title: input.extraction.status === 'COMPLETED' ? 'Resume text extracted' : 'Resume extraction failed',
      message:
        input.extraction.status === 'COMPLETED'
          ? 'Resume text is available for AI analysis.'
          : 'Extraction needs attention before AI analysis can proceed.',
      occurredAt: input.extraction.updatedAt,
      href: '/profile#resume-heading',
    });
  }

  if (input.analysis) {
    items.push({
      id: `analysis-${input.analysis.status.toLocaleLowerCase('en-US')}`,
      title: input.analysis.status === 'COMPLETED' ? 'AI resume review prepared' : 'AI resume review failed',
      message:
        input.analysis.status === 'COMPLETED'
          ? 'AI findings are available for user review.'
          : 'AI review needs attention.',
      occurredAt: input.analysis.updatedAt,
      href: '/profile#analysis-heading',
    });
  }

  return sortActivities(items).slice(0, 5);
}

function countAiReviewItems(input: BuildDashboardModelInput): number {
  return input.analysis?.status === 'COMPLETED' || input.analysis?.status === 'FAILED' ? 1 : 0;
}

function getExtractionSummary(
  activeResume: ResumeResponse | null,
  extraction: ResumeExtractionResponse | null,
): string {
  if (!activeResume) {
    return 'Upload a resume before extracting text.';
  }

  if (!extraction) {
    return 'Text extraction has not started for the active resume.';
  }

  if (extraction.status === 'COMPLETED') {
    return `Extraction completed with ${extraction.wordCount ?? 0} words.`;
  }

  if (extraction.status === 'FAILED') {
    return 'Extraction failed and needs attention.';
  }

  return 'Extraction is in progress.';
}

function getAnalysisSummary(
  extraction: ResumeExtractionResponse | null,
  analysis: ResumeAnalysisResponse | null,
): string {
  if (extraction?.status !== 'COMPLETED') {
    return 'Complete resume extraction before AI analysis.';
  }

  if (!analysis) {
    return 'AI analysis has not started for the active resume.';
  }

  if (analysis.status === 'COMPLETED') {
    return 'AI findings are ready for review. Candidate profile was not modified.';
  }

  if (analysis.status === 'FAILED') {
    return analysis.errorMessage ?? 'AI analysis failed and needs attention.';
  }

  return 'AI analysis is in progress.';
}

function isProfileReady(profile: CandidateProfileResponse): boolean {
  return Boolean(
    profile.headline &&
      profile.summary &&
      profile.currentLocation &&
      profile.desiredRole &&
      profile.experiences.length > 0 &&
      profile.skills.length > 0,
  );
}

function sortActivities(items: DashboardActivityItem[]): DashboardActivityItem[] {
  return [...items].sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
}

function formatWorkflowStatus(value: string): string {
  return value
    .toLocaleLowerCase('en-US')
    .split('_')
    .map((part) => `${part.charAt(0).toLocaleUpperCase('en-US')}${part.slice(1)}`)
    .join(' ');
}

function getAnalysisSummaryCounts(value: unknown): DashboardAnalysisSummary {
  if (!isRecord(value)) {
    return {
      skillsCount: 0,
      experienceCount: 0,
      languagesCount: 0,
      certificationsCount: 0,
    };
  }

  return {
    skillsCount: arrayLength(value.skills),
    experienceCount: arrayLength(value.experience),
    languagesCount: arrayLength(value.languages),
    certificationsCount: arrayLength(value.certifications),
  };
}

function arrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
