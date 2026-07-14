import { describe, expect, it } from 'vitest';
import {
  experienceCreateInputFromFormData,
  profileInputFromFormData,
  skillCreateInputFromFormData,
} from './form-data';

describe('candidate profile form-data mappers', () => {
  it('maps profile updates without exposing userId', () => {
    const formData = new FormData();
    formData.set('headline', 'Senior Engineer');
    formData.set('countryCode', 'BR');
    formData.set('yearsOfExperience', '8');
    formData.set('remoteOnly', 'on');
    formData.set('userId', 'should-not-be-used');

    const input = profileInputFromFormData(formData);

    expect(input).toMatchObject({
      headline: 'Senior Engineer',
      countryCode: 'BR',
      yearsOfExperience: 8,
      remoteOnly: true,
    });
    expect(input).not.toHaveProperty('userId');
  });

  it('clears endDate when creating a current experience', () => {
    const formData = new FormData();
    formData.set('companyName', 'Acme');
    formData.set('roleTitle', 'Engineer');
    formData.set('startDate', '2024-01-01');
    formData.set('endDate', '2025-01-01');
    formData.set('current', 'on');
    formData.set('technologies', 'TypeScript, NestJS');

    expect(experienceCreateInputFromFormData(formData)).toMatchObject({
      companyName: 'Acme',
      current: true,
      endDate: null,
      technologies: ['TypeScript', 'NestJS'],
    });
  });

  it('maps skill creation metadata', () => {
    const formData = new FormData();
    formData.set('name', 'TypeScript');
    formData.set('category', 'LANGUAGE');
    formData.set('proficiencyLevel', 'ADVANCED');
    formData.set('yearsOfExperience', '7');
    formData.set('isPrimary', 'on');

    expect(skillCreateInputFromFormData(formData)).toMatchObject({
      name: 'TypeScript',
      category: 'LANGUAGE',
      proficiencyLevel: 'ADVANCED',
      yearsOfExperience: 7,
      isPrimary: true,
    });
  });
});
