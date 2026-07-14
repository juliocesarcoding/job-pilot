import { describe, expect, it } from 'vitest';
import { toResumeAnalysisViewModel } from './analysis-view';

describe('toResumeAnalysisViewModel', () => {
  it('maps AI analysis display data', () => {
    const viewModel = toResumeAnalysisViewModel({
      summary: {
        headline: 'Senior Full Stack Engineer',
        overview: 'Builds TypeScript systems.',
        seniority: 'Senior',
        confidence: 0.82,
      },
      skills: [{ name: 'TypeScript', category: 'LANGUAGE', evidence: 'Used on recent roles.' }],
      experience: [],
      education: [],
      languages: [{ name: 'English', proficiency: 'Advanced', evidence: 'Resume states advanced English.' }],
      certifications: [],
    });

    expect(viewModel?.summary.headline).toBe('Senior Full Stack Engineer');
    expect(viewModel?.skills[0]?.name).toBe('TypeScript');
    expect(viewModel?.languages[0]?.proficiency).toBe('Advanced');
  });

  it('returns null for invalid analysis display data', () => {
    expect(toResumeAnalysisViewModel(null)).toBeNull();
  });
});
