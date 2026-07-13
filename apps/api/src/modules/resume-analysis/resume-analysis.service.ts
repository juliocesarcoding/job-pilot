import { RESUME_ANALYSIS_PROMPT_VERSION } from '@job-pilot/ai';
import { ResumeExtractionMetadata, ResumeAnalysisResponse } from '@job-pilot/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ZodError } from 'zod';
import { loadApiEnv } from '../../config/env';
import { ResumeAnalysisError } from './domain/errors';
import { validateResumeAnalysis } from './domain/resume-analysis.schema';
import {
  OpenAIResumeAnalysisProviderError,
} from './providers/openai-resume-analysis.provider';
import {
  RESUME_ANALYSIS_PROVIDER,
  ResumeAnalysisProvider,
} from './providers/resume-analysis.provider';
import { mapResumeAnalysis } from './resume-analysis.mapper';
import {
  RESUME_ANALYSIS_REPOSITORY,
  ResumeAnalysisExtractionRecord,
  ResumeAnalysisRepository,
} from './repositories/resume-analysis.repository';

@Injectable()
export class ResumeAnalysisService {
  constructor(
    @Inject(RESUME_ANALYSIS_REPOSITORY)
    private readonly repository: ResumeAnalysisRepository,
    @Inject(RESUME_ANALYSIS_PROVIDER)
    private readonly provider: ResumeAnalysisProvider,
  ) {}

  async analyzeResume(resumeId: string): Promise<ResumeAnalysisResponse> {
    const extraction = await this.getOwnedExtraction(resumeId);

    if (extraction.extractionStatus !== 'COMPLETED') {
      throw new ResumeAnalysisError(
        'RESUME_EXTRACTION_NOT_COMPLETED',
        'Resume extraction must be completed before analysis',
      );
    }

    const existing = await this.repository.findByExtractionId(extraction.id);

    if (existing) {
      throw new ResumeAnalysisError('RESUME_ANALYSIS_ALREADY_EXISTS', 'Resume analysis already exists');
    }

    const pending = await this.repository.createPending({
      resumeExtractionId: extraction.id,
      provider: 'openai',
      model: loadApiEnv(process.env).OPENAI_MODEL ?? '',
      promptVersion: RESUME_ANALYSIS_PROMPT_VERSION,
    });

    await this.repository.updateStatus(pending.id, 'PROCESSING');

    try {
      const providerResult = await this.provider.analyze({
        extractedText: extraction.extractedText,
        language: extraction.detectedLanguage,
        metadata: mapExtractionMetadata(extraction),
      });
      const validated = validateResumeAnalysis(providerResult.analysis);
      const completed = await this.repository.complete({
        analysisId: pending.id,
        analysis: { ...validated },
        confidence: providerResult.confidence,
        inputTokens: providerResult.inputTokens,
        outputTokens: providerResult.outputTokens,
        totalTokens: providerResult.totalTokens,
      });

      return mapResumeAnalysis(completed);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        await this.repository.fail({
          analysisId: pending.id,
          errorMessage: 'Invalid AI response',
        });
        throw new ResumeAnalysisError('INVALID_RESUME_ANALYSIS_RESPONSE', 'Invalid AI response');
      }

      const errorMessage =
        error instanceof OpenAIResumeAnalysisProviderError ? error.message : 'Provider failure';

      await this.repository.fail({
        analysisId: pending.id,
        errorMessage,
      });
      throw new ResumeAnalysisError('RESUME_ANALYSIS_PROVIDER_FAILED', 'Resume analysis provider failed');
    }
  }

  async getAnalysis(resumeId: string): Promise<ResumeAnalysisResponse> {
    const extraction = await this.getOwnedExtraction(resumeId);
    const analysis = await this.repository.findByExtractionId(extraction.id);

    if (!analysis) {
      throw new ResumeAnalysisError('RESUME_EXTRACTION_NOT_FOUND', 'Resume analysis was not found');
    }

    return mapResumeAnalysis(analysis);
  }

  private async getOwnedExtraction(resumeId: string): Promise<ResumeAnalysisExtractionRecord> {
    const env = loadApiEnv(process.env);
    const profile = await this.repository.findCandidateProfileByUserEmail(env.JOBPILOT_DEV_USER_EMAIL);

    if (!profile) {
      throw new ResumeAnalysisError('RESUME_NOT_FOUND', 'Resume was not found');
    }

    const resume = await this.repository.findOwnedResume(profile.id, resumeId);

    if (!resume) {
      throw new ResumeAnalysisError('RESUME_NOT_FOUND', 'Resume was not found');
    }

    const extraction = await this.repository.findOwnedExtractionByResumeId(profile.id, resumeId);

    if (!extraction) {
      throw new ResumeAnalysisError('RESUME_EXTRACTION_NOT_FOUND', 'Resume extraction was not found');
    }

    return extraction;
  }
}

function mapExtractionMetadata(extraction: ResumeAnalysisExtractionRecord): ResumeExtractionMetadata | null {
  if (!extraction.metadata || typeof extraction.metadata !== 'object' || Array.isArray(extraction.metadata)) {
    return null;
  }

  return extraction.metadata as unknown as ResumeExtractionMetadata;
}
