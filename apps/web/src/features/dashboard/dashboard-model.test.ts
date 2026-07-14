import { describe, expect, it } from 'vitest';
import { buildDashboardModel, type BuildDashboardModelInput } from './dashboard-model';

describe('buildDashboardModel', () => {
  it('prioritizes completing the profile on an empty dashboard', () => {
    const dashboard = buildDashboardModel(makeInput());

    expect(dashboard.nextBestAction).toMatchObject({
      id: 'profile-incomplete',
      label: 'Complete profile basics',
    });
    expect(dashboard.attentionItems.some((item) => item.id === 'profile-incomplete')).toBe(false);
    expect(dashboard.recommendedJobs.state).toBe('waiting-for-profile');
  });

  it('prioritizes uploading a resume after the profile is ready', () => {
    const dashboard = buildDashboardModel(makeInput({ profile: readyProfile() }));

    expect(dashboard.nextBestAction).toMatchObject({
      id: 'resume-missing',
      label: 'Upload resume',
    });
    expect(dashboard.readiness.find((item) => item.key === 'profile')?.status).toBe('ready');
    expect(dashboard.readiness.find((item) => item.key === 'resume')?.status).toBe('needs-action');
  });

  it('prioritizes extraction before analysis', () => {
    const dashboard = buildDashboardModel(
      makeInput({
        profile: readyProfile(),
        resumes: [resume()],
        activeResume: resume(),
      }),
    );

    expect(dashboard.nextBestAction).toMatchObject({
      id: 'extraction-missing',
      label: 'Extract resume text',
    });
    expect(dashboard.attentionItems.some((item) => item.id === 'extraction-missing')).toBe(false);
  });

  it('prioritizes analysis after extraction is completed', () => {
    const dashboard = buildDashboardModel(
      makeInput({
        profile: readyProfile(),
        resumes: [resume()],
        activeResume: resume(),
        extraction: extraction('COMPLETED'),
      }),
    );

    expect(dashboard.nextBestAction).toMatchObject({
      id: 'analysis-missing',
      label: 'Analyze resume',
    });
    expect(dashboard.readiness.find((item) => item.key === 'extraction')?.status).toBe('ready');
  });

  it('shows AI review pending and recent AI activity after analysis completes', () => {
    const dashboard = buildDashboardModel(
      makeInput({
        profile: readyProfile(),
        resumes: [resume()],
        activeResume: resume(),
        extraction: extraction('COMPLETED'),
        analysis: analysis('COMPLETED'),
      }),
    );

    expect(dashboard.nextBestAction).toMatchObject({
      id: 'ai-review-pending',
      label: 'Review AI findings',
    });
    expect(dashboard.workspace.analysis.summary).toMatchObject({
      skillsCount: 2,
      experienceCount: 1,
      languagesCount: 1,
      certificationsCount: 1,
    });
    expect(dashboard.recentAiActivity.map((item) => item.id)).toContain('analysis-completed');
    expect(dashboard.recentProgress.map((item) => item.id)).toContain('analysis-completed');
  });

  it('surfaces failed extraction before other resume work', () => {
    const dashboard = buildDashboardModel(
      makeInput({
        profile: readyProfile(),
        resumes: [resume()],
        activeResume: resume(),
        extraction: extraction('FAILED'),
      }),
    );

    expect(dashboard.nextBestAction).toMatchObject({
      id: 'extraction-failed',
      label: 'Open resume workflow',
    });
    expect(dashboard.readiness.find((item) => item.key === 'extraction')?.status).toBe('failed');
  });

  it('keeps jobs and applications as documented placeholders without fake metrics', () => {
    const dashboard = buildDashboardModel(
      makeInput({
        profile: readyProfile(),
        resumes: [resume()],
        activeResume: resume(),
        extraction: extraction('COMPLETED'),
        analysis: analysis('COMPLETED'),
      }),
    );

    expect(dashboard.recommendedJobs.title).toContain('coming later');
    expect(dashboard.applicationsSummary.title).toBe('Applications are not active yet');
  });
});

function makeInput(overrides: Partial<BuildDashboardModelInput> = {}): BuildDashboardModelInput {
  return {
    profile: emptyProfile(),
    resumes: [],
    activeResume: null,
    extraction: null,
    analysis: null,
    sectionErrors: {
      resumes: null,
      extraction: null,
      analysis: null,
    },
    ...overrides,
  };
}

function emptyProfile(): BuildDashboardModelInput['profile'] {
  return {
    id: 'profile-1',
    userId: 'user-1',
    headline: null,
    summary: null,
    currentLocation: null,
    countryCode: null,
    timezone: null,
    englishLevel: null,
    yearsOfExperience: null,
    desiredRole: null,
    desiredSalaryMin: null,
    desiredSalaryMax: null,
    desiredSalaryCurrency: null,
    remoteOnly: true,
    openToContract: true,
    openToFullTime: true,
    requiresVisaSponsorship: false,
    linkedinUrl: null,
    githubUrl: null,
    portfolioUrl: null,
    createdAt: '2026-07-14T10:00:00.000Z',
    updatedAt: '2026-07-14T10:00:00.000Z',
    experiences: [],
    skills: [],
  };
}

function readyProfile(): BuildDashboardModelInput['profile'] {
  return {
    ...emptyProfile(),
    headline: 'Senior Full Stack Engineer',
    summary: 'Builds product systems for remote teams.',
    currentLocation: 'Sao Paulo, Brazil',
    desiredRole: 'Senior Software Engineer',
    experiences: [
      {
        id: 'exp-1',
        companyName: 'Acme',
        roleTitle: 'Engineer',
        employmentType: 'FULL_TIME',
        location: 'Remote',
        remote: true,
        startDate: '2022-01-01T00:00:00.000Z',
        endDate: null,
        current: true,
        description: null,
        achievements: [],
        technologies: [],
        createdAt: '2026-07-14T10:00:00.000Z',
        updatedAt: '2026-07-14T10:00:00.000Z',
      },
    ],
    skills: [
      {
        id: 'skill-1',
        skillId: 'global-skill-1',
        name: 'TypeScript',
        normalizedName: 'typescript',
        category: 'LANGUAGE',
        proficiencyLevel: 'ADVANCED',
        yearsOfExperience: 7,
        lastUsedYear: 2026,
        isPrimary: true,
        createdAt: '2026-07-14T10:00:00.000Z',
        updatedAt: '2026-07-14T10:00:00.000Z',
      },
    ],
  };
}

function resume(): NonNullable<BuildDashboardModelInput['activeResume']> {
  return {
    id: 'resume-1',
    candidateProfileId: 'profile-1',
    originalFileName: 'resume.pdf',
    storedFileName: 'resume.pdf',
    mimeType: 'application/pdf',
    extension: '.pdf',
    fileSize: 1234,
    storageProvider: 'LOCAL',
    storagePath: 'profile-1/resume.pdf',
    checksum: 'checksum',
    version: 1,
    uploadedAt: '2026-07-14T10:05:00.000Z',
    active: true,
    createdAt: '2026-07-14T10:05:00.000Z',
    updatedAt: '2026-07-14T10:05:00.000Z',
  };
}

function extraction(status: 'COMPLETED' | 'FAILED'): BuildDashboardModelInput['extraction'] {
  return {
    id: 'extraction-1',
    resumeId: 'resume-1',
    status,
    extractedText: status === 'COMPLETED' ? 'Resume text' : '',
    detectedLanguage: 'en',
    pageCount: 1,
    wordCount: status === 'COMPLETED' ? 120 : null,
    metadata: null,
    createdAt: '2026-07-14T10:10:00.000Z',
    updatedAt: '2026-07-14T10:10:00.000Z',
  };
}

function analysis(status: 'COMPLETED' | 'FAILED'): BuildDashboardModelInput['analysis'] {
  return {
    id: 'analysis-1',
    resumeExtractionId: 'extraction-1',
    status,
    provider: 'openai',
    model: 'gpt-5-mini',
    promptVersion: '1.0.0',
    analysis:
      status === 'COMPLETED'
        ? {
            summary: { headline: 'Engineer' },
            skills: [{ name: 'TypeScript' }, { name: 'NestJS' }],
            experience: [{ role: 'Engineer' }],
            languages: [{ name: 'English' }],
            certifications: [{ name: 'AWS' }],
          }
        : null,
    confidence: status === 'COMPLETED' ? 0.8 : null,
    inputTokens: 100,
    outputTokens: 200,
    totalTokens: 300,
    startedAt: '2026-07-14T10:15:00.000Z',
    finishedAt: '2026-07-14T10:16:00.000Z',
    errorMessage: status === 'FAILED' ? 'Provider failed' : null,
    createdAt: '2026-07-14T10:15:00.000Z',
    updatedAt: '2026-07-14T10:16:00.000Z',
  };
}
