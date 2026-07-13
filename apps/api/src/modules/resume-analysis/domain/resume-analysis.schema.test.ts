import { describe, expect, it } from 'vitest';
import { validateResumeAnalysis } from './resume-analysis.schema';

describe('resumeAnalysisSchema', () => {
  it('accepts structured resume analysis', () => {
    expect(validateResumeAnalysis(createValidAnalysis()).summary.headline).toBe('Senior Engineer');
  });

  it('rejects free-form or incomplete responses', () => {
    expect(() => validateResumeAnalysis('great resume')).toThrow();
    expect(() => validateResumeAnalysis({ summary: {} })).toThrow();
  });
});

function createValidAnalysis(): unknown {
  return {
    summary: {
      headline: 'Senior Engineer',
      overview: 'Builds APIs.',
      seniority: 'senior',
      confidence: 0.8,
    },
    skills: [{ name: 'TypeScript', category: 'LANGUAGE', evidence: 'TypeScript' }],
    experience: [
      {
        company: 'Acme',
        role: 'Engineer',
        startDate: null,
        endDate: null,
        current: null,
        description: 'Built APIs.',
        evidence: 'Engineer at Acme',
      },
    ],
    education: [],
    languages: [{ name: 'English', proficiency: null, evidence: 'English' }],
    certifications: [],
  };
}
