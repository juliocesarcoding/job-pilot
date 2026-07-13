import { Prisma } from '@job-pilot/database';
import { ResumeAnalysisResponse } from '@job-pilot/shared';
import { ResumeAnalysisRecord } from './repositories/resume-analysis.repository';

export function mapResumeAnalysis(analysis: ResumeAnalysisRecord): ResumeAnalysisResponse {
  return {
    id: analysis.id,
    resumeExtractionId: analysis.resumeExtractionId,
    status: analysis.status,
    provider: analysis.provider,
    model: analysis.model,
    promptVersion: analysis.promptVersion,
    analysis: mapJson(analysis.analysis),
    confidence: analysis.confidence?.toNumber() ?? null,
    inputTokens: analysis.inputTokens,
    outputTokens: analysis.outputTokens,
    totalTokens: analysis.totalTokens,
    startedAt: analysis.startedAt.toISOString(),
    finishedAt: analysis.finishedAt?.toISOString() ?? null,
    errorMessage: analysis.errorMessage,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
  };
}

function mapJson(value: Prisma.JsonValue): unknown {
  return value;
}
