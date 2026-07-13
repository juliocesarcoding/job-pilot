export type ResumeAnalysisErrorCode =
  | 'RESUME_NOT_FOUND'
  | 'RESUME_EXTRACTION_NOT_FOUND'
  | 'RESUME_ANALYSIS_ALREADY_EXISTS'
  | 'RESUME_EXTRACTION_NOT_COMPLETED'
  | 'RESUME_ANALYSIS_PROVIDER_FAILED'
  | 'INVALID_RESUME_ANALYSIS_RESPONSE';

export class ResumeAnalysisError extends Error {
  constructor(
    public readonly code: ResumeAnalysisErrorCode,
    message: string,
  ) {
    super(message);
  }
}
