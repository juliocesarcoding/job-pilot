import { ResumeExtractionMetadata, ResumeExtractionResponse } from '@job-pilot/shared';
import { Inject, Injectable } from '@nestjs/common';
import { performance } from 'node:perf_hooks';
import { loadApiEnv } from '../../config/env';
import { ResumeExtractionError } from './domain/errors';
import {
  ResumeExtractionFormat,
  extractRawResumeText,
} from './domain/resume-text-extractor';
import { countWords, detectBasicLanguage } from './domain/text-analysis';
import { mapResumeExtraction } from './resume-extraction.mapper';
import {
  RESUME_EXTRACTION_REPOSITORY,
  ResumeExtractionRepository,
  ResumeExtractionResumeRecord,
} from './repositories/resume-extraction.repository';
import {
  RESUME_STORAGE_PROVIDER_TOKEN,
  ResumeStorageProvider,
} from '../resume/storage/resume-storage.provider';

@Injectable()
export class ResumeExtractionService {
  constructor(
    @Inject(RESUME_EXTRACTION_REPOSITORY)
    private readonly repository: ResumeExtractionRepository,
    @Inject(RESUME_STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: ResumeStorageProvider,
  ) {}

  async extractResume(resumeId: string): Promise<ResumeExtractionResponse> {
    const resume = await this.getOwnedResume(resumeId);
    const existing = await this.repository.findByResumeId(resume.id);

    if (existing) {
      throw new ResumeExtractionError(
        'RESUME_EXTRACTION_ALREADY_EXISTS',
        'Resume extraction already exists',
      );
    }

    const format = this.detectFormat(resume);
    const extraction = await this.repository.createPending(resume.id);
    const startedAt = performance.now();

    await this.repository.updateStatus(extraction.id, 'PROCESSING');

    try {
      if (!(await this.storageProvider.exists(resume.storagePath))) {
        throw new Error('Resume file is missing from storage');
      }

      const buffer = await this.storageProvider.read(resume.storagePath);
      const raw = await extractRawResumeText(format, buffer);
      const wordCount = countWords(raw.text);
      const detectedLanguage = detectBasicLanguage(raw.text);
      const extractionDurationMs = Math.round(performance.now() - startedAt);
      const metadata: ResumeExtractionMetadata = {
        format,
        parser: raw.parser,
        wordCount,
        detectedLanguage,
        extractionDurationMs,
        ...(raw.pageCount === null ? {} : { pageCount: raw.pageCount }),
        ...(raw.warnings.length === 0 ? {} : { warnings: raw.warnings }),
      };

      const completed = await this.repository.complete({
        extractionId: extraction.id,
        extractedText: raw.text,
        detectedLanguage,
        pageCount: raw.pageCount,
        wordCount,
        metadata: { ...metadata },
      });

      return mapResumeExtraction(completed);
    } catch {
      await this.repository.fail({
        extractionId: extraction.id,
        metadata: {
          format,
          extractionDurationMs: Math.round(performance.now() - startedAt),
          failureReason: 'EXTRACTION_FAILED',
        },
      });

      throw new ResumeExtractionError('RESUME_EXTRACTION_FAILED', 'Resume extraction failed');
    }
  }

  async getExtraction(resumeId: string): Promise<ResumeExtractionResponse> {
    const resume = await this.getOwnedResume(resumeId);
    const extraction = await this.repository.findByResumeId(resume.id);

    if (!extraction) {
      throw new ResumeExtractionError('RESUME_NOT_FOUND', 'Resume extraction was not found');
    }

    return mapResumeExtraction(extraction);
  }

  private detectFormat(resume: ResumeExtractionResumeRecord): ResumeExtractionFormat {
    if (resume.mimeType === 'application/pdf' && resume.extension === '.pdf') {
      return '.pdf';
    }

    if (
      resume.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
      resume.extension === '.docx'
    ) {
      return '.docx';
    }

    throw new ResumeExtractionError('UNSUPPORTED_RESUME_FORMAT', 'Unsupported resume format');
  }

  private async getOwnedResume(resumeId: string): Promise<ResumeExtractionResumeRecord> {
    const env = loadApiEnv(process.env);
    const profile = await this.repository.findCandidateProfileByUserEmail(env.JOBPILOT_DEV_USER_EMAIL);

    if (!profile) {
      throw new ResumeExtractionError('RESUME_NOT_FOUND', 'Resume was not found');
    }

    const resume = await this.repository.findOwnedResume(profile.id, resumeId);

    if (!resume) {
      throw new ResumeExtractionError('RESUME_NOT_FOUND', 'Resume was not found');
    }

    return resume;
  }
}
