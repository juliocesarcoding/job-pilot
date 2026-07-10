import { describe, expect, it } from 'vitest';
import {
  candidateProfileUpsertSchema,
  experienceCreateSchema,
  normalizeSkillName,
} from './candidate-profile';

describe('candidate profile shared schemas', () => {
  it('rejects salary ranges where min is greater than max', () => {
    const result = candidateProfileUpsertSchema.safeParse({
      desiredSalaryMin: 100,
      desiredSalaryMax: 50,
    });

    expect(result.success).toBe(false);
  });

  it('rejects inconsistent experience dates', () => {
    const result = experienceCreateSchema.safeParse({
      companyName: 'Acme',
      roleTitle: 'Developer',
      startDate: '2024-01-01',
      endDate: '2023-01-01',
    });

    expect(result.success).toBe(false);
  });

  it('normalizes skill names deterministically', () => {
    expect(normalizeSkillName('  TypeScript   Advanced  ')).toBe('typescript advanced');
  });
});
