export interface ApiErrorBody {
  statusCode?: number;
  code?: string;
  message?: string | string[];
}

export class JobPilotApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function getUserFacingApiError(error: unknown): string {
  if (error instanceof JobPilotApiError) {
    return mapApiError(error);
  }

  if (error instanceof TypeError) {
    return 'The API is unavailable. Check that the local API is running.';
  }

  return 'Something went wrong. Please try again.';
}

function mapApiError(error: JobPilotApiError): string {
  switch (error.code) {
    case 'PROFILE_NOT_FOUND':
      return 'Candidate profile was not found. Run the local database seed and try again.';
    case 'INVALID_INPUT':
      return error.message;
    case 'DUPLICATE_CANDIDATE_SKILL':
      return 'This skill is already on the profile.';
    case 'INVALID_RESUME_UPLOAD':
      return error.message;
    case 'RESUME_NOT_FOUND':
      return 'Resume was not found.';
    case 'RESUME_DELETE_NOT_ALLOWED':
      return 'The only active resume cannot be deleted.';
    case 'RESUME_EXTRACTION_ALREADY_EXISTS':
      return 'This resume already has an extraction result.';
    case 'UNSUPPORTED_RESUME_FORMAT':
      return 'This resume format is not supported for extraction.';
    case 'RESUME_EXTRACTION_FAILED':
      return 'Resume text extraction failed.';
    case 'RESUME_EXTRACTION_NOT_FOUND':
      return 'Run resume extraction before analysis.';
    case 'RESUME_EXTRACTION_NOT_COMPLETED':
      return 'Resume analysis is available after extraction completes.';
    case 'RESUME_ANALYSIS_ALREADY_EXISTS':
      return 'This resume already has an AI analysis.';
    case 'RESUME_ANALYSIS_PROVIDER_FAILED':
      return 'The AI provider could not analyze this resume. Check the saved analysis error details.';
    case 'INVALID_RESUME_ANALYSIS_RESPONSE':
      return 'The AI response could not be validated.';
    default:
      return error.message || 'The API request failed.';
  }
}
