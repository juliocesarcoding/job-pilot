import { ResumeExtractionMetadata, ResumeExtractionResponse } from '@job-pilot/shared';
import { Prisma } from '@job-pilot/database';
import { ResumeExtractionRecord } from './repositories/resume-extraction.repository';

export function mapResumeExtraction(extraction: ResumeExtractionRecord): ResumeExtractionResponse {
  return {
    id: extraction.id,
    resumeId: extraction.resumeId,
    status: extraction.extractionStatus,
    extractedText: extraction.extractedText,
    detectedLanguage: extraction.detectedLanguage,
    pageCount: extraction.pageCount,
    wordCount: extraction.wordCount,
    metadata: mapMetadata(extraction.metadata),
    createdAt: extraction.createdAt.toISOString(),
    updatedAt: extraction.updatedAt.toISOString(),
  };
}

function mapMetadata(metadata: Prisma.JsonValue): ResumeExtractionMetadata | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  return metadata as unknown as ResumeExtractionMetadata;
}
