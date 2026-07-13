import { Prisma } from '@job-pilot/database';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { OpenAIResumeAnalysisProviderError } from './providers/openai-resume-analysis.provider';
import {
  ResumeAnalysisProvider,
  ResumeAnalysisProviderInput,
  ResumeAnalysisProviderResult,
} from './providers/resume-analysis.provider';
import {
  AnalysisStatus,
  ResumeAnalysisExtractionRecord,
  ResumeAnalysisRecord,
  ResumeAnalysisRepository,
  ResumeAnalysisResumeRecord,
} from './repositories/resume-analysis.repository';
import { ResumeAnalysisService } from './resume-analysis.service';

const testEmail = 'analysis@resume.test';

describe('ResumeAnalysisService', () => {
  let repository: FakeResumeAnalysisRepository;
  let provider: FakeResumeAnalysisProvider;
  let service: ResumeAnalysisService;
  let originalDevEmail: string | undefined;
  let originalNodeEnv: string | undefined;
  let originalModel: string | undefined;

  beforeEach(() => {
    originalDevEmail = process.env.JOBPILOT_DEV_USER_EMAIL;
    originalNodeEnv = process.env.NODE_ENV;
    originalModel = process.env.OPENAI_MODEL;
    process.env.JOBPILOT_DEV_USER_EMAIL = testEmail;
    process.env.NODE_ENV = 'test';
    process.env.OPENAI_MODEL = 'test-model';
    repository = new FakeResumeAnalysisRepository();
    provider = new FakeResumeAnalysisProvider();
    service = new ResumeAnalysisService(repository, provider);
  });

  afterEach(() => {
    restoreEnv('JOBPILOT_DEV_USER_EMAIL', originalDevEmail);
    restoreEnv('NODE_ENV', originalNodeEnv);
    restoreEnv('OPENAI_MODEL', originalModel);
  });

  it('persists prompt version, completed analysis, token usage, confidence, and status transitions', async () => {
    const result = await service.analyzeResume('resume-1');

    expect(result.status).toBe('COMPLETED');
    expect(result.promptVersion).toBe('1.0.0');
    expect(result.provider).toBe('openai');
    expect(result.model).toBe('test-model');
    expect(result.confidence).toBe(0.77);
    expect(result.totalTokens).toBe(30);
    expect(repository.statusTransitions).toEqual(['PENDING', 'PROCESSING', 'COMPLETED']);
  });

  it('rejects duplicate analysis', async () => {
    repository.analysis = createAnalysis({ status: 'COMPLETED' });

    await expect(service.analyzeResume('resume-1')).rejects.toMatchObject({
      code: 'RESUME_ANALYSIS_ALREADY_EXISTS',
    });
  });

  it('requires completed extraction', async () => {
    repository.extraction = createExtraction({ extractionStatus: 'PROCESSING' });

    await expect(service.analyzeResume('resume-1')).rejects.toMatchObject({
      code: 'RESUME_EXTRACTION_NOT_COMPLETED',
    });
  });

  it('persists FAILED and returns 422 for invalid AI response', async () => {
    provider.result = {
      provider: 'openai',
      model: 'test-model',
      analysis: { invalid: true },
      confidence: null,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
    };

    await expect(service.analyzeResume('resume-1')).rejects.toMatchObject({
      code: 'INVALID_RESUME_ANALYSIS_RESPONSE',
    });
    expect(repository.analysis?.status).toBe('FAILED');
    expect(repository.analysis?.errorMessage).toBe('Invalid AI response');
  });

  it('persists FAILED and returns provider failure', async () => {
    provider.error = new OpenAIResumeAnalysisProviderError(
      'OpenAI provider failed with status 404 model_not_found',
    );

    await expect(service.analyzeResume('resume-1')).rejects.toMatchObject({
      code: 'RESUME_ANALYSIS_PROVIDER_FAILED',
    });
    expect(repository.analysis?.status).toBe('FAILED');
    expect(repository.analysis?.errorMessage).toBe(
      'OpenAI provider failed with status 404 model_not_found',
    );
  });

  it('enforces ownership', async () => {
    repository.resume = null;

    await expect(service.analyzeResume('resume-other')).rejects.toMatchObject({
      code: 'RESUME_NOT_FOUND',
    });
  });
});

class FakeResumeAnalysisProvider implements ResumeAnalysisProvider {
  result: ResumeAnalysisProviderResult = {
    provider: 'openai',
    model: 'test-model',
    analysis: createValidAnalysis(),
    confidence: 0.77,
    inputTokens: 10,
    outputTokens: 20,
    totalTokens: 30,
  };
  error: Error | null = null;

  async analyze(_input: ResumeAnalysisProviderInput): Promise<ResumeAnalysisProviderResult> {
    if (this.error) {
      throw this.error;
    }

    return this.result;
  }
}

class FakeResumeAnalysisRepository implements ResumeAnalysisRepository {
  resume: ResumeAnalysisResumeRecord | null = { id: 'resume-1' };
  extraction: ResumeAnalysisExtractionRecord | null = createExtraction({ extractionStatus: 'COMPLETED' });
  analysis: ResumeAnalysisRecord | null = null;
  readonly statusTransitions: AnalysisStatus[] = [];

  async findCandidateProfileByUserEmail(email: string): Promise<{ id: string; userId: string } | null> {
    return email === testEmail ? { id: 'profile-1', userId: 'user-1' } : null;
  }

  async findOwnedResume(
    _candidateProfileId: string,
    resumeId: string,
  ): Promise<ResumeAnalysisResumeRecord | null> {
    return this.resume?.id === resumeId ? this.resume : null;
  }

  async findOwnedExtractionByResumeId(
    _candidateProfileId: string,
    resumeId: string,
  ): Promise<ResumeAnalysisExtractionRecord | null> {
    return this.extraction?.resumeId === resumeId ? this.extraction : null;
  }

  async findByExtractionId(resumeExtractionId: string): Promise<ResumeAnalysisRecord | null> {
    return this.analysis?.resumeExtractionId === resumeExtractionId ? this.analysis : null;
  }

  async createPending(input: {
    resumeExtractionId: string;
    provider: string;
    model: string;
    promptVersion: string;
  }): Promise<ResumeAnalysisRecord> {
    this.analysis = createAnalysis({
      status: 'PENDING',
      provider: input.provider,
      model: input.model,
      promptVersion: input.promptVersion,
    });
    this.statusTransitions.push('PENDING');
    return this.analysis;
  }

  async updateStatus(analysisId: string, status: AnalysisStatus): Promise<ResumeAnalysisRecord> {
    const updated = {
      ...this.requireAnalysis(analysisId),
      status,
      updatedAt: new Date(),
    };
    this.analysis = updated;
    this.statusTransitions.push(status);
    return updated;
  }

  async complete(input: {
    analysisId: string;
    analysis: Prisma.InputJsonObject;
    confidence: number | null;
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  }): Promise<ResumeAnalysisRecord> {
    const updated: ResumeAnalysisRecord = {
      ...this.requireAnalysis(input.analysisId),
      status: 'COMPLETED',
      analysis: input.analysis as unknown as Prisma.JsonValue,
      confidence: input.confidence === null ? null : new Prisma.Decimal(input.confidence),
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      totalTokens: input.totalTokens,
      finishedAt: new Date(),
      errorMessage: null,
      updatedAt: new Date(),
    };
    this.analysis = updated;
    this.statusTransitions.push('COMPLETED');
    return updated;
  }

  async fail(input: { analysisId: string; errorMessage: string }): Promise<ResumeAnalysisRecord> {
    const updated = {
      ...this.requireAnalysis(input.analysisId),
      status: 'FAILED' as const,
      errorMessage: input.errorMessage,
      finishedAt: new Date(),
      updatedAt: new Date(),
    };
    this.analysis = updated;
    this.statusTransitions.push('FAILED');
    return updated;
  }

  private requireAnalysis(analysisId: string): ResumeAnalysisRecord {
    if (!this.analysis || this.analysis.id !== analysisId) {
      throw new Error('Analysis not found');
    }

    return this.analysis;
  }
}

function createExtraction(input: {
  extractionStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}): ResumeAnalysisExtractionRecord {
  return {
    id: 'extraction-1',
    resumeId: 'resume-1',
    extractionStatus: input.extractionStatus,
    extractedText: 'Senior engineer with TypeScript experience',
    detectedLanguage: 'en',
    metadata: {
      wordCount: 5,
      detectedLanguage: 'en',
      extractionDurationMs: 10,
      format: '.pdf',
      parser: 'pdf-parse',
    },
  };
}

function createAnalysis(input: {
  status: AnalysisStatus;
  provider?: string;
  model?: string;
  promptVersion?: string;
}): ResumeAnalysisRecord {
  const now = new Date();

  return {
    id: 'analysis-1',
    resumeExtractionId: 'extraction-1',
    status: input.status,
    provider: input.provider ?? 'openai',
    model: input.model ?? 'test-model',
    promptVersion: input.promptVersion ?? '1.0.0',
    analysis: {},
    confidence: null,
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    startedAt: now,
    finishedAt: null,
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  };
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function createValidAnalysis(): unknown {
  return {
    summary: {
      headline: 'Senior Engineer',
      overview: 'Builds APIs.',
      seniority: 'senior',
      confidence: 0.8,
    },
    skills: [{ name: 'TypeScript', category: 'LANGUAGE', evidence: 'TypeScript' }],
    experience: [],
    education: [],
    languages: [],
    certifications: [],
  };
}
