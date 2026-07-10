export type CandidateProfileErrorCode =
  | 'INVALID_INPUT'
  | 'USER_NOT_FOUND'
  | 'PROFILE_NOT_FOUND'
  | 'RESOURCE_NOT_FOUND'
  | 'DUPLICATE_CANDIDATE_SKILL';

export class CandidateProfileError extends Error {
  constructor(
    public readonly code: CandidateProfileErrorCode,
    message: string,
  ) {
    super(message);
  }
}
