import { Prisma, PrismaClient, prisma } from '@job-pilot/database';

export const RESUME_ANALYSIS_REPOSITORY = Symbol('RESUME_ANALYSIS_REPOSITORY');

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ResumeAnalysisCandidateProfileIdentity {
  id: string;
  userId: string;
}

export interface ResumeAnalysisExtractionRecord {
  id: string;
  resumeId: string;
  extractionStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  extractedText: string;
  detectedLanguage: string | null;
  metadata: Prisma.JsonValue;
}

export interface ResumeAnalysisResumeRecord {
  id: string;
}

export interface ResumeAnalysisRecord {
  id: string;
  resumeExtractionId: string;
  status: AnalysisStatus;
  provider: string;
  model: string;
  promptVersion: string;
  analysis: Prisma.JsonValue;
  confidence: Prisma.Decimal | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  startedAt: Date;
  finishedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompleteAnalysisInput {
  analysisId: string;
  analysis: Prisma.InputJsonObject;
  confidence: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
}

export interface FailAnalysisInput {
  analysisId: string;
  errorMessage: string;
}

export interface ResumeAnalysisRepository {
  findCandidateProfileByUserEmail(email: string): Promise<ResumeAnalysisCandidateProfileIdentity | null>;
  findOwnedResume(candidateProfileId: string, resumeId: string): Promise<ResumeAnalysisResumeRecord | null>;
  findOwnedExtractionByResumeId(
    candidateProfileId: string,
    resumeId: string,
  ): Promise<ResumeAnalysisExtractionRecord | null>;
  findByExtractionId(resumeExtractionId: string): Promise<ResumeAnalysisRecord | null>;
  createPending(input: {
    resumeExtractionId: string;
    provider: string;
    model: string;
    promptVersion: string;
  }): Promise<ResumeAnalysisRecord>;
  updateStatus(analysisId: string, status: AnalysisStatus): Promise<ResumeAnalysisRecord>;
  complete(input: CompleteAnalysisInput): Promise<ResumeAnalysisRecord>;
  fail(input: FailAnalysisInput): Promise<ResumeAnalysisRecord>;
}

export class PrismaResumeAnalysisRepository implements ResumeAnalysisRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async findCandidateProfileByUserEmail(
    email: string,
  ): Promise<ResumeAnalysisCandidateProfileIdentity | null> {
    return this.client.candidateProfile.findFirst({
      where: {
        deletedAt: null,
        user: {
          email,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });
  }

  async findOwnedExtractionByResumeId(
    candidateProfileId: string,
    resumeId: string,
  ): Promise<ResumeAnalysisExtractionRecord | null> {
    return this.client.resumeExtraction.findFirst({
      where: {
        resumeId,
        resume: {
          candidateProfileId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        resumeId: true,
        extractionStatus: true,
        extractedText: true,
        detectedLanguage: true,
        metadata: true,
      },
    });
  }

  async findOwnedResume(
    candidateProfileId: string,
    resumeId: string,
  ): Promise<ResumeAnalysisResumeRecord | null> {
    return this.client.resume.findFirst({
      where: {
        id: resumeId,
        candidateProfileId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
  }

  async findByExtractionId(resumeExtractionId: string): Promise<ResumeAnalysisRecord | null> {
    return this.client.resumeAnalysis.findUnique({
      where: {
        resumeExtractionId,
      },
    });
  }

  async createPending(input: {
    resumeExtractionId: string;
    provider: string;
    model: string;
    promptVersion: string;
  }): Promise<ResumeAnalysisRecord> {
    return this.client.resumeAnalysis.create({
      data: {
        resumeExtractionId: input.resumeExtractionId,
        status: 'PENDING',
        provider: input.provider,
        model: input.model,
        promptVersion: input.promptVersion,
        analysis: {},
        startedAt: new Date(),
      },
    });
  }

  async updateStatus(analysisId: string, status: AnalysisStatus): Promise<ResumeAnalysisRecord> {
    return this.client.resumeAnalysis.update({
      where: {
        id: analysisId,
      },
      data: {
        status,
      },
    });
  }

  async complete(input: CompleteAnalysisInput): Promise<ResumeAnalysisRecord> {
    return this.client.$transaction((transaction) =>
      transaction.resumeAnalysis.update({
        where: {
          id: input.analysisId,
        },
        data: {
          status: 'COMPLETED',
          analysis: input.analysis,
          confidence: input.confidence,
          inputTokens: input.inputTokens,
          outputTokens: input.outputTokens,
          totalTokens: input.totalTokens,
          finishedAt: new Date(),
          errorMessage: null,
        },
      }),
    );
  }

  async fail(input: FailAnalysisInput): Promise<ResumeAnalysisRecord> {
    return this.client.$transaction((transaction) =>
      transaction.resumeAnalysis.update({
        where: {
          id: input.analysisId,
        },
        data: {
          status: 'FAILED',
          errorMessage: input.errorMessage,
          finishedAt: new Date(),
        },
      }),
    );
  }
}
