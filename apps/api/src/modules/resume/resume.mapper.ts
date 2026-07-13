import { ResumeResponse } from '@job-pilot/shared';
import { ResumeRecord } from './repositories/resume.repository';

export function mapResume(resume: ResumeRecord): ResumeResponse {
  return {
    id: resume.id,
    candidateProfileId: resume.candidateProfileId,
    originalFileName: resume.originalFileName,
    storedFileName: resume.storedFileName,
    mimeType: resume.mimeType,
    extension: resume.extension,
    fileSize: resume.fileSize,
    storageProvider: resume.storageProvider,
    storagePath: resume.storagePath,
    checksum: resume.checksum,
    version: resume.version,
    uploadedAt: resume.uploadedAt.toISOString(),
    active: resume.active,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  };
}
