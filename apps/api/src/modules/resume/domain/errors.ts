export type ResumeErrorCode =
  | 'INVALID_RESUME_UPLOAD'
  | 'CANDIDATE_PROFILE_NOT_FOUND'
  | 'RESUME_NOT_FOUND'
  | 'RESUME_DELETE_NOT_ALLOWED';

export class ResumeError extends Error {
  constructor(
    public readonly code: ResumeErrorCode,
    message: string,
  ) {
    super(message);
  }
}
