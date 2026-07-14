import type {
  CandidateProfileUpsertInput,
  CandidateSkillCreateInput,
  CandidateSkillUpdateInput,
  ExperienceCreateInput,
  ExperienceUpdateInput,
} from '@job-pilot/shared';

export function profileInputFromFormData(formData: FormData): CandidateProfileUpsertInput {
  return {
    headline: nullableString(formData, 'headline'),
    summary: nullableString(formData, 'summary'),
    currentLocation: nullableString(formData, 'currentLocation'),
    countryCode: nullableString(formData, 'countryCode'),
    timezone: nullableString(formData, 'timezone'),
    englishLevel: nullableString(formData, 'englishLevel') as CandidateProfileUpsertInput['englishLevel'],
    yearsOfExperience: nullableNumber(formData, 'yearsOfExperience'),
    desiredRole: nullableString(formData, 'desiredRole'),
    desiredSalaryMin: nullableNumber(formData, 'desiredSalaryMin'),
    desiredSalaryMax: nullableNumber(formData, 'desiredSalaryMax'),
    desiredSalaryCurrency: nullableString(formData, 'desiredSalaryCurrency'),
    remoteOnly: formData.get('remoteOnly') === 'on',
    openToContract: formData.get('openToContract') === 'on',
    openToFullTime: formData.get('openToFullTime') === 'on',
    requiresVisaSponsorship: formData.get('requiresVisaSponsorship') === 'on',
    linkedinUrl: nullableString(formData, 'linkedinUrl'),
    githubUrl: nullableString(formData, 'githubUrl'),
    portfolioUrl: nullableString(formData, 'portfolioUrl'),
  };
}

export function experienceCreateInputFromFormData(formData: FormData): ExperienceCreateInput {
  const current = formData.get('current') === 'on';

  return {
    companyName: stringValue(formData, 'companyName'),
    roleTitle: stringValue(formData, 'roleTitle'),
    employmentType: nullableString(formData, 'employmentType') as ExperienceCreateInput['employmentType'],
    location: nullableString(formData, 'location'),
    remote: formData.get('remote') === 'on',
    startDate: stringValue(formData, 'startDate') as unknown as Date,
    endDate: current ? null : (nullableString(formData, 'endDate') as unknown as Date | null),
    current,
    description: nullableString(formData, 'description'),
    achievements: listValue(formData, 'achievements'),
    technologies: listValue(formData, 'technologies'),
  };
}

export function experienceUpdateInputFromFormData(formData: FormData): ExperienceUpdateInput {
  return experienceCreateInputFromFormData(formData);
}

export function skillCreateInputFromFormData(formData: FormData): CandidateSkillCreateInput {
  return {
    name: stringValue(formData, 'name'),
    category: nullableString(formData, 'category') as CandidateSkillCreateInput['category'],
    proficiencyLevel: nullableString(formData, 'proficiencyLevel') as CandidateSkillCreateInput['proficiencyLevel'],
    yearsOfExperience: nullableNumber(formData, 'yearsOfExperience'),
    lastUsedYear: nullableNumber(formData, 'lastUsedYear'),
    isPrimary: formData.get('isPrimary') === 'on',
  };
}

export function skillUpdateInputFromFormData(formData: FormData): CandidateSkillUpdateInput {
  return {
    proficiencyLevel: nullableString(formData, 'proficiencyLevel') as CandidateSkillUpdateInput['proficiencyLevel'],
    yearsOfExperience: nullableNumber(formData, 'yearsOfExperience'),
    lastUsedYear: nullableNumber(formData, 'lastUsedYear'),
    isPrimary: formData.get('isPrimary') === 'on',
  };
}

function stringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function nullableString(formData: FormData, key: string): string | null {
  const value = stringValue(formData, key);
  return value.length > 0 ? value : null;
}

function nullableNumber(formData: FormData, key: string): number | null {
  const value = nullableString(formData, key);
  return value === null ? null : Number(value);
}

function listValue(formData: FormData, key: string): string[] {
  const value = nullableString(formData, key);
  return value === null
    ? []
    : value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}
