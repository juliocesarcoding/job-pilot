import { describe, expect, it } from 'vitest';
import { validateSelectedResumeFile } from './file-validation';

describe('validateSelectedResumeFile', () => {
  it('rejects invalid resume files before upload', () => {
    const file = new File(['plain text'], 'resume.txt', { type: 'text/plain' });

    expect(validateSelectedResumeFile(file)).toEqual({
      valid: false,
      message: 'Choose a PDF or DOCX resume.',
    });
  });

  it('accepts PDF resumes', () => {
    const file = new File(['%PDF'], 'resume.pdf', { type: 'application/pdf' });

    expect(validateSelectedResumeFile(file)).toEqual({ valid: true, message: null });
  });
});
