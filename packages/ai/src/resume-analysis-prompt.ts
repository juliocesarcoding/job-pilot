export const RESUME_ANALYSIS_PROMPT_VERSION = '1.0.0';

export function buildResumeAnalysisSystemPrompt(): string {
  return [
    'Analyze the extracted resume text and return only valid JSON.',
    'Do not include markdown, explanations, or text outside JSON.',
    'Do not invent experience, dates, companies, education, skills, or certifications.',
    'Unknown information must be null.',
    'Use arrays for skills, experience, education, languages, and certifications.',
    'Return keys: summary, skills, experience, education, languages, certifications.',
  ].join(' ');
}
