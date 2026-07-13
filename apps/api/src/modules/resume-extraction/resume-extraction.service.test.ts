import { Prisma } from '@job-pilot/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResumeStorageProvider } from '../resume/storage/resume-storage.provider';
import { ResumeExtractionError } from './domain/errors';
import { extractRawResumeText } from './domain/resume-text-extractor';
import {
  ResumeExtractionRepository,
  ResumeExtractionRecord,
  ResumeExtractionResumeRecord,
} from './repositories/resume-extraction.repository';
import { ResumeExtractionService } from './resume-extraction.service';

vi.mock('./domain/resume-text-extractor', () => ({
  extractRawResumeText: vi.fn(),
}));

const testEmail = 'extract@resume.test';

describe('ResumeExtractionService', () => {
  let repository: FakeResumeExtractionRepository;
  let storage: FakeResumeStorageProvider;
  let service: ResumeExtractionService;
  let originalDevEmail: string | undefined;

  beforeEach(() => {
    originalDevEmail = process.env.JOBPILOT_DEV_USER_EMAIL;
    process.env.JOBPILOT_DEV_USER_EMAIL = testEmail;
    repository = new FakeResumeExtractionRepository();
    storage = new FakeResumeStorageProvider();
    service = new ResumeExtractionService(repository, storage);
    vi.mocked(extractRawResumeText).mockReset();
  });

  afterEach(() => {
    if (originalDevEmail === undefined) {
      delete process.env.JOBPILOT_DEV_USER_EMAIL;
    } else {
      process.env.JOBPILOT_DEV_USER_EMAIL = originalDevEmail;
    }
  });

  it('extracts text, metadata, page count, language, and status transitions', async () => {
    repository.resume = createResume({ extension: '.pdf', mimeType: 'application/pdf' });
    storage.files.set(repository.resume.storagePath, Buffer.from('pdf'));
    vi.mocked(extractRawResumeText).mockResolvedValue({
      text: 'Senior engineer with development experience and systems projects',
      pageCount: 3,
      parser: 'pdf-parse',
      warnings: [],
    });

    const result = await service.extractResume(repository.resume.id);

    expect(result.status).toBe('COMPLETED');
    expect(result.extractedText).toContain('Senior engineer');
    expect(result.pageCount).toBe(3);
    expect(result.wordCount).toBe(8);
    expect(result.detectedLanguage).toBe('en');
    expect(result.metadata).toMatchObject({
      format: '.pdf',
      parser: 'pdf-parse',
      wordCount: 8,
      detectedLanguage: 'en',
      pageCount: 3,
    });
    expect(repository.statusTransitions).toEqual(['PENDING', 'PROCESSING', 'COMPLETED']);
  });

  it('extracts DOCX text without page count', async () => {
    repository.resume = createResume({
      extension: '.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    storage.files.set(repository.resume.storagePath, Buffer.from('docx'));
    vi.mocked(extractRawResumeText).mockResolvedValue({
      text: 'Engenheiro com experiência em desenvolvimento de sistemas',
      pageCount: null,
      parser: 'mammoth',
      warnings: ['Skipped unsupported element'],
    });

    const result = await service.extractResume(repository.resume.id);

    expect(result.status).toBe('COMPLETED');
    expect(result.pageCount).toBeNull();
    expect(result.detectedLanguage).toBe('pt');
    expect(result.metadata).toMatchObject({
      format: '.docx',
      parser: 'mammoth',
      warnings: ['Skipped unsupported element'],
    });
  });

  it('rejects duplicate extraction requests', async () => {
    repository.resume = createResume({ extension: '.pdf', mimeType: 'application/pdf' });
    repository.extraction = createExtraction({
      resumeId: repository.resume.id,
      extractionStatus: 'COMPLETED',
    });

    await expect(service.extractResume(repository.resume.id)).rejects.toMatchObject({
      code: 'RESUME_EXTRACTION_ALREADY_EXISTS',
    });
  });

  it('rejects unsupported stored resume formats', async () => {
    repository.resume = createResume({ extension: '.txt', mimeType: 'text/plain' });

    await expect(service.extractResume(repository.resume.id)).rejects.toMatchObject({
      code: 'UNSUPPORTED_RESUME_FORMAT',
    });
  });

  it('stores FAILED status and hides internal errors when the file is missing', async () => {
    repository.resume = createResume({ extension: '.pdf', mimeType: 'application/pdf' });

    await expect(service.extractResume(repository.resume.id)).rejects.toMatchObject({
      code: 'RESUME_EXTRACTION_FAILED',
    });
    expect(repository.extraction?.extractionStatus).toBe('FAILED');
    expect(repository.extraction?.extractedText).toBe('');
  });

  it('enforces ownership when retrieving an extraction', async () => {
    repository.resume = null;

    await expect(service.getExtraction('resume-other')).rejects.toBeInstanceOf(ResumeExtractionError);
  });
});

class FakeResumeStorageProvider implements ResumeStorageProvider {
  readonly files = new Map<string, Buffer>();

  async save(): Promise<{ storedFileName: string; storagePath: string }> {
    throw new Error('save is not used by extraction tests');
  }

  async delete(): Promise<void> {
    throw new Error('delete is not used by extraction tests');
  }

  async exists(storagePath: string): Promise<boolean> {
    return this.files.has(storagePath);
  }

  async read(storagePath: string): Promise<Buffer> {
    const file = this.files.get(storagePath);

    if (!file) {
      throw new Error('File not found');
    }

    return file;
  }

  getPath(storagePath: string): string {
    return storagePath;
  }
}

class FakeResumeExtractionRepository implements ResumeExtractionRepository {
  resume: ResumeExtractionResumeRecord | null = null;
  extraction: ResumeExtractionRecord | null = null;
  readonly statusTransitions: string[] = [];

  async findCandidateProfileByUserEmail(email: string): Promise<{ id: string; userId: string } | null> {
    if (email !== testEmail) {
      return null;
    }

    return {
      id: 'profile-1',
      userId: 'user-1',
    };
  }

  async findOwnedResume(
    candidateProfileId: string,
    resumeId: string,
  ): Promise<ResumeExtractionResumeRecord | null> {
    if (!this.resume || this.resume.id !== resumeId || this.resume.candidateProfileId !== candidateProfileId) {
      return null;
    }

    return this.resume;
  }

  async findByResumeId(resumeId: string): Promise<ResumeExtractionRecord | null> {
    if (this.extraction?.resumeId !== resumeId) {
      return null;
    }

    return this.extraction;
  }

  async createPending(resumeId: string): Promise<ResumeExtractionRecord> {
    this.extraction = createExtraction({
      resumeId,
      extractionStatus: 'PENDING',
    });
    this.statusTransitions.push('PENDING');
    return this.extraction;
  }

  async updateStatus(
    extractionId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
  ): Promise<ResumeExtractionRecord> {
    this.extraction = {
      ...this.requireExtraction(extractionId),
      extractionStatus: status,
      updatedAt: new Date(),
    };
    this.statusTransitions.push(status);
    return this.extraction;
  }

  async complete(input: {
    extractionId: string;
    extractedText: string;
    detectedLanguage: string | null;
    pageCount: number | null;
    wordCount: number;
    metadata: Prisma.InputJsonObject;
  }): Promise<ResumeExtractionRecord> {
    const updated: ResumeExtractionRecord = {
      ...this.requireExtraction(input.extractionId),
      extractionStatus: 'COMPLETED',
      extractedText: input.extractedText,
      detectedLanguage: input.detectedLanguage,
      pageCount: input.pageCount,
      wordCount: input.wordCount,
      metadata: input.metadata as unknown as Prisma.JsonValue,
      updatedAt: new Date(),
    };
    this.extraction = updated;
    this.statusTransitions.push('COMPLETED');
    return updated;
  }

  async fail(input: {
    extractionId: string;
    metadata: Prisma.InputJsonObject;
  }): Promise<ResumeExtractionRecord> {
    const updated: ResumeExtractionRecord = {
      ...this.requireExtraction(input.extractionId),
      extractionStatus: 'FAILED',
      extractedText: '',
      detectedLanguage: null,
      pageCount: null,
      wordCount: null,
      metadata: input.metadata as unknown as Prisma.JsonValue,
      updatedAt: new Date(),
    };
    this.extraction = updated;
    this.statusTransitions.push('FAILED');
    return updated;
  }

  private requireExtraction(extractionId: string): ResumeExtractionRecord {
    if (!this.extraction || this.extraction.id !== extractionId) {
      throw new Error('Extraction not found');
    }

    return this.extraction;
  }
}

function createResume(input: {
  extension: string;
  mimeType: string;
}): ResumeExtractionResumeRecord {
  return {
    id: 'resume-1',
    candidateProfileId: 'profile-1',
    extension: input.extension,
    mimeType: input.mimeType,
    storagePath: 'profile-1/resume-file',
    deletedAt: null,
  };
}

function createExtraction(input: {
  resumeId: string;
  extractionStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}): ResumeExtractionRecord {
  const now = new Date();

  return {
    id: 'extraction-1',
    resumeId: input.resumeId,
    extractionStatus: input.extractionStatus,
    extractedText: '',
    detectedLanguage: null,
    pageCount: null,
    wordCount: null,
    metadata: null,
    createdAt: now,
    updatedAt: now,
  };
}
