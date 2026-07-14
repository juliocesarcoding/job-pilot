const resumeMaxFileSizeBytes = 10 * 1024 * 1024;
const supportedResumeMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export interface ResumeFileValidation {
  valid: boolean;
  message: string | null;
}

export function validateSelectedResumeFile(file: File | null): ResumeFileValidation {
  if (!file) {
    return { valid: false, message: 'Choose a PDF or DOCX resume first.' };
  }

  if (file.size === 0) {
    return { valid: false, message: 'The selected file is empty.' };
  }

  if (file.size > resumeMaxFileSizeBytes) {
    return { valid: false, message: 'Resume files must be 10 MB or smaller.' };
  }

  if (!supportedResumeMimeTypes.includes(file.type as (typeof supportedResumeMimeTypes)[number])) {
    return { valid: false, message: 'Choose a PDF or DOCX resume.' };
  }

  return { valid: true, message: null };
}
