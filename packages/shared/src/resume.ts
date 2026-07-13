import { createHash, randomUUID } from 'node:crypto';
import { extname } from 'node:path';

export const RESUME_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const resumeStorageProviders = ['LOCAL'] as const;
export const supportedResumeMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
export const supportedResumeExtensions = ['.pdf', '.docx'] as const;

export type ResumeStorageProviderName = (typeof resumeStorageProviders)[number];
export type SupportedResumeMimeType = (typeof supportedResumeMimeTypes)[number];
export type SupportedResumeExtension = (typeof supportedResumeExtensions)[number];

export interface ResumeUploadFile {
  originalFileName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface ResumeValidationResult {
  extension: SupportedResumeExtension;
  mimeType: SupportedResumeMimeType;
}

export interface ResumeResponse {
  id: string;
  candidateProfileId: string;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  extension: string;
  fileSize: number;
  storageProvider: ResumeStorageProviderName;
  storagePath: string;
  checksum: string;
  version: number;
  uploadedAt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const extractionStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;

export type ExtractionStatusName = (typeof extractionStatuses)[number];

export interface ResumeExtractionMetadata {
  wordCount: number;
  detectedLanguage: string | null;
  extractionDurationMs: number;
  format: SupportedResumeExtension;
  parser: string;
  pageCount?: number;
  warnings?: string[];
}

export interface ResumeExtractionResponse {
  id: string;
  resumeId: string;
  status: ExtractionStatusName;
  extractedText: string;
  detectedLanguage: string | null;
  pageCount: number | null;
  wordCount: number | null;
  metadata: ResumeExtractionMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export function validateResumeUploadFile(file: ResumeUploadFile | undefined): ResumeValidationResult {
  if (!file) {
    throw new Error('Resume file is required');
  }

  if (file.size === 0 || file.buffer.length === 0) {
    throw new Error('Resume file cannot be empty');
  }

  if (file.size > RESUME_MAX_FILE_SIZE_BYTES) {
    throw new Error('Resume file cannot exceed 10 MB');
  }

  if (!isSupportedResumeMimeType(file.mimeType)) {
    throw new Error('Resume file type must be PDF or DOCX');
  }

  const extension = getResumeExtension(file.originalFileName);

  if (!isSupportedResumeExtension(extension)) {
    throw new Error('Resume file extension must be .pdf or .docx');
  }

  if (!mimeMatchesExtension(file.mimeType, extension)) {
    throw new Error('Resume file extension does not match its MIME type');
  }

  return {
    extension,
    mimeType: file.mimeType,
  };
}

export function generateResumeStoredFileName(extension: SupportedResumeExtension): string {
  return `${randomUUID()}${extension}`;
}

export function calculateResumeChecksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export function buildResumeStoragePath(candidateProfileId: string, storedFileName: string): string {
  return `${candidateProfileId}/${storedFileName}`;
}

function getResumeExtension(fileName: string): string {
  return extname(fileName).toLocaleLowerCase('en-US');
}

function isSupportedResumeMimeType(value: string): value is SupportedResumeMimeType {
  return supportedResumeMimeTypes.includes(value as SupportedResumeMimeType);
}

function isSupportedResumeExtension(value: string): value is SupportedResumeExtension {
  return supportedResumeExtensions.includes(value as SupportedResumeExtension);
}

function mimeMatchesExtension(mimeType: SupportedResumeMimeType, extension: SupportedResumeExtension): boolean {
  return (
    (mimeType === 'application/pdf' && extension === '.pdf') ||
    (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
      extension === '.docx')
  );
}
