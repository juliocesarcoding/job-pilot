import { describe, expect, it } from 'vitest';
import {
  RESUME_MAX_FILE_SIZE_BYTES,
  buildResumeStoragePath,
  calculateResumeChecksum,
  generateResumeStoredFileName,
  validateResumeUploadFile,
} from './resume';

describe('resume shared helpers', () => {
  it('validates supported PDF files', () => {
    const result = validateResumeUploadFile({
      originalFileName: 'resume.pdf',
      mimeType: 'application/pdf',
      size: 4,
      buffer: Buffer.from('%PDF'),
    });

    expect(result.extension).toBe('.pdf');
  });

  it('rejects unsupported TXT files', () => {
    expect(() =>
      validateResumeUploadFile({
        originalFileName: 'resume.txt',
        mimeType: 'text/plain',
        size: 5,
        buffer: Buffer.from('hello'),
      }),
    ).toThrow('Resume file type must be PDF or DOCX');
  });

  it('rejects files larger than 10 MB', () => {
    expect(() =>
      validateResumeUploadFile({
        originalFileName: 'resume.pdf',
        mimeType: 'application/pdf',
        size: RESUME_MAX_FILE_SIZE_BYTES + 1,
        buffer: Buffer.alloc(1),
      }),
    ).toThrow('Resume file cannot exceed 10 MB');
  });

  it('generates uuid file names with the original extension', () => {
    expect(generateResumeStoredFileName('.pdf')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/,
    );
  });

  it('calculates sha-256 checksums', () => {
    expect(calculateResumeChecksum(Buffer.from('resume'))).toBe(
      'a83a31320d921b888a48fa5edd0b4b5a29984de6e96bf7b8ac7d29ba06caf616',
    );
  });

  it('builds provider-relative storage paths', () => {
    expect(buildResumeStoragePath('candidate-1', 'file.pdf')).toBe('candidate-1/file.pdf');
  });
});
