import { Prisma, PrismaClient, prisma } from '@job-pilot/database';

export const RESUME_EXTRACTION_REPOSITORY = Symbol('RESUME_EXTRACTION_REPOSITORY');

export interface ResumeExtractionCandidateProfileIdentity {
  id: string;
  userId: string;
}

export interface ResumeExtractionResumeRecord {
  id: string;
  candidateProfileId: string;
  mimeType: string;
  extension: string;
  storagePath: string;
  deletedAt: Date | null;
}

export type ResumeExtractionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ResumeExtractionRecord {
  id: string;
  resumeId: string;
  extractionStatus: ResumeExtractionStatus;
  extractedText: string;
  detectedLanguage: string | null;
  pageCount: number | null;
  wordCount: number | null;
  metadata: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompleteExtractionInput {
  extractionId: string;
  extractedText: string;
  detectedLanguage: string | null;
  pageCount: number | null;
  wordCount: number;
  metadata: Prisma.InputJsonObject;
}

export interface FailExtractionInput {
  extractionId: string;
  metadata: Prisma.InputJsonObject;
}

export interface ResumeExtractionRepository {
  findCandidateProfileByUserEmail(email: string): Promise<ResumeExtractionCandidateProfileIdentity | null>;
  findOwnedResume(
    candidateProfileId: string,
    resumeId: string,
  ): Promise<ResumeExtractionResumeRecord | null>;
  findByResumeId(resumeId: string): Promise<ResumeExtractionRecord | null>;
  createPending(resumeId: string): Promise<ResumeExtractionRecord>;
  updateStatus(extractionId: string, status: ResumeExtractionStatus): Promise<ResumeExtractionRecord>;
  complete(input: CompleteExtractionInput): Promise<ResumeExtractionRecord>;
  fail(input: FailExtractionInput): Promise<ResumeExtractionRecord>;
}

export class PrismaResumeExtractionRepository implements ResumeExtractionRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async findCandidateProfileByUserEmail(
    email: string,
  ): Promise<ResumeExtractionCandidateProfileIdentity | null> {
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

  async findOwnedResume(
    candidateProfileId: string,
    resumeId: string,
  ): Promise<ResumeExtractionResumeRecord | null> {
    return this.client.resume.findFirst({
      where: {
        id: resumeId,
        candidateProfileId,
        deletedAt: null,
      },
      select: {
        id: true,
        candidateProfileId: true,
        mimeType: true,
        extension: true,
        storagePath: true,
        deletedAt: true,
      },
    });
  }

  async findByResumeId(resumeId: string): Promise<ResumeExtractionRecord | null> {
    return this.client.resumeExtraction.findUnique({
      where: {
        resumeId,
      },
    });
  }

  async createPending(resumeId: string): Promise<ResumeExtractionRecord> {
    return this.client.resumeExtraction.create({
      data: {
        resumeId,
        extractionStatus: 'PENDING',
        extractedText: '',
      },
    });
  }

  async updateStatus(
    extractionId: string,
    status: ResumeExtractionStatus,
  ): Promise<ResumeExtractionRecord> {
    return this.client.resumeExtraction.update({
      where: {
        id: extractionId,
      },
      data: {
        extractionStatus: status,
      },
    });
  }

  async complete(input: CompleteExtractionInput): Promise<ResumeExtractionRecord> {
    return this.client.$transaction((transaction) =>
      transaction.resumeExtraction.update({
        where: {
          id: input.extractionId,
        },
        data: {
          extractionStatus: 'COMPLETED',
          extractedText: input.extractedText,
          detectedLanguage: input.detectedLanguage,
          pageCount: input.pageCount,
          wordCount: input.wordCount,
          metadata: input.metadata,
        },
      }),
    );
  }

  async fail(input: FailExtractionInput): Promise<ResumeExtractionRecord> {
    return this.client.$transaction((transaction) =>
      transaction.resumeExtraction.update({
        where: {
          id: input.extractionId,
        },
        data: {
          extractionStatus: 'FAILED',
          extractedText: '',
          detectedLanguage: null,
          pageCount: null,
          wordCount: null,
          metadata: input.metadata,
        },
      }),
    );
  }
}
