import { ResumeExtractionMetadata } from '@job-pilot/shared';
import { ResumeAnalysis } from '../domain/resume-analysis.schema';

export const RESUME_ANALYSIS_PROVIDER = Symbol('RESUME_ANALYSIS_PROVIDER');

export interface ResumeAnalysisProviderInput {
  extractedText: string;
  language: string | null;
  metadata: ResumeExtractionMetadata | null;
}

export interface ResumeAnalysisProviderResult {
  provider: string;
  model: string;
  analysis: unknown;
  confidence: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
}

export interface ValidatedResumeAnalysisProviderResult extends ResumeAnalysisProviderResult {
  analysis: ResumeAnalysis;
}

export interface ResumeAnalysisProvider {
  analyze(input: ResumeAnalysisProviderInput): Promise<ResumeAnalysisProviderResult>;
}
