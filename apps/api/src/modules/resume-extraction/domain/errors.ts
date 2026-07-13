export type ResumeExtractionErrorCode =
  | 'RESUME_NOT_FOUND'
  | 'RESUME_EXTRACTION_ALREADY_EXISTS'
  | 'UNSUPPORTED_RESUME_FORMAT'
  | 'RESUME_EXTRACTION_FAILED';

export class ResumeExtractionError extends Error {
  constructor(
    public readonly code: ResumeExtractionErrorCode,
    message: string,
  ) {
    super(message);
  }
}
