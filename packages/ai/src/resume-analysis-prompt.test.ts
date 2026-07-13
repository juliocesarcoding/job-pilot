import { describe, expect, it } from 'vitest';
import { RESUME_ANALYSIS_PROMPT_VERSION, buildResumeAnalysisSystemPrompt } from './resume-analysis-prompt';

describe('resume analysis prompt', () => {
  it('has an initial prompt version and structured JSON instructions', () => {
    expect(RESUME_ANALYSIS_PROMPT_VERSION).toBe('1.0.0');
    expect(buildResumeAnalysisSystemPrompt()).toContain('return only valid JSON');
  });
});
