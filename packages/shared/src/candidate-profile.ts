import { z } from 'zod';

export const englishLevels = [
  'BEGINNER',
  'ELEMENTARY',
  'INTERMEDIATE',
  'UPPER_INTERMEDIATE',
  'ADVANCED',
  'FLUENT',
  'NATIVE',
] as const;

export const employmentTypes = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'FREELANCE',
  'INTERNSHIP',
  'OTHER',
] as const;

export const skillCategories = [
  'LANGUAGE',
  'FRAMEWORK',
  'DATABASE',
  'CLOUD',
  'DEVOPS',
  'TOOL',
  'ERP',
  'BUSINESS',
  'SOFT_SKILL',
  'OTHER',
] as const;

export const proficiencyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

export const englishLevelSchema = z.enum(englishLevels);
export const employmentTypeSchema = z.enum(employmentTypes);
export const skillCategorySchema = z.enum(skillCategories);
export const proficiencyLevelSchema = z.enum(proficiencyLevels);

const optionalText = z.string().trim().min(1).nullable().optional();
const optionalUrl = z.string().trim().url().nullable().optional();
const optionalNonNegativeInt = z.number().int().min(0).nullable().optional();
const optionalNonNegativeNumber = z.number().min(0).nullable().optional();

export function normalizeSkillName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
}

export const candidateProfileUpsertSchema = z
  .object({
    headline: optionalText,
    summary: optionalText,
    currentLocation: optionalText,
    countryCode: z.string().trim().length(2).toUpperCase().nullable().optional(),
    timezone: optionalText,
    englishLevel: englishLevelSchema.nullable().optional(),
    yearsOfExperience: optionalNonNegativeInt,
    desiredRole: optionalText,
    desiredSalaryMin: optionalNonNegativeNumber,
    desiredSalaryMax: optionalNonNegativeNumber,
    desiredSalaryCurrency: z.string().trim().length(3).toUpperCase().nullable().optional(),
    remoteOnly: z.boolean().optional(),
    openToContract: z.boolean().optional(),
    openToFullTime: z.boolean().optional(),
    requiresVisaSponsorship: z.boolean().optional(),
    linkedinUrl: optionalUrl,
    githubUrl: optionalUrl,
    portfolioUrl: optionalUrl,
  })
  .strict()
  .superRefine((value, context) => {
    if (
      value.desiredSalaryMin != null &&
      value.desiredSalaryMax != null &&
      value.desiredSalaryMin > value.desiredSalaryMax
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['desiredSalaryMin'],
        message: 'desiredSalaryMin cannot be greater than desiredSalaryMax',
      });
    }
  });

const experienceBaseSchema = z.object({
  companyName: z.string().trim().min(1),
  roleTitle: z.string().trim().min(1),
  employmentType: employmentTypeSchema.nullable().optional(),
  location: optionalText,
  remote: z.boolean().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  current: z.boolean().optional(),
  description: optionalText,
  achievements: z.array(z.string().trim().min(1)).optional(),
  technologies: z.array(z.string().trim().min(1)).optional(),
});

export const experienceCreateSchema = experienceBaseSchema
  .strict()
  .superRefine((value, context) => {
    validateExperienceDates(value.startDate, value.endDate ?? null, value.current ?? false, context);
  });

export const experienceUpdateSchema = experienceBaseSchema.partial().strict().superRefine((value, context) => {
  if (value.startDate) {
    validateExperienceDates(value.startDate, value.endDate ?? null, value.current ?? false, context);
  }
});

export const candidateSkillCreateSchema = z
  .object({
    name: z.string().trim().min(1),
    category: skillCategorySchema.nullable().optional(),
    proficiencyLevel: proficiencyLevelSchema.nullable().optional(),
    yearsOfExperience: optionalNonNegativeNumber,
    lastUsedYear: z.number().int().min(1970).max(new Date().getFullYear() + 1).nullable().optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict();

export const candidateSkillUpdateSchema = z
  .object({
    proficiencyLevel: proficiencyLevelSchema.nullable().optional(),
    yearsOfExperience: optionalNonNegativeNumber,
    lastUsedYear: z.number().int().min(1970).max(new Date().getFullYear() + 1).nullable().optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict();

function validateExperienceDates(
  startDate: Date,
  endDate: Date | null,
  current: boolean,
  context: z.RefinementCtx,
): void {
  if (current && endDate !== null) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'endDate must be null when current is true',
    });
  }

  if (endDate !== null && endDate < startDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'endDate cannot be before startDate',
    });
  }
}

export type CandidateProfileUpsertInput = z.infer<typeof candidateProfileUpsertSchema>;
export type ExperienceCreateInput = z.infer<typeof experienceCreateSchema>;
export type ExperienceUpdateInput = z.infer<typeof experienceUpdateSchema>;
export type CandidateSkillCreateInput = z.infer<typeof candidateSkillCreateSchema>;
export type CandidateSkillUpdateInput = z.infer<typeof candidateSkillUpdateSchema>;
export type EnglishLevel = (typeof englishLevels)[number];
export type EmploymentType = (typeof employmentTypes)[number];
export type SkillCategory = (typeof skillCategories)[number];
export type ProficiencyLevel = (typeof proficiencyLevels)[number];

export interface CandidateProfileResponse {
  id: string;
  userId: string;
  headline: string | null;
  summary: string | null;
  currentLocation: string | null;
  countryCode: string | null;
  timezone: string | null;
  englishLevel: EnglishLevel | null;
  yearsOfExperience: number | null;
  desiredRole: string | null;
  desiredSalaryMin: number | null;
  desiredSalaryMax: number | null;
  desiredSalaryCurrency: string | null;
  remoteOnly: boolean;
  openToContract: boolean;
  openToFullTime: boolean;
  requiresVisaSponsorship: boolean;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  createdAt: string;
  updatedAt: string;
  experiences: ExperienceResponse[];
  skills: CandidateSkillResponse[];
}

export interface ExperienceResponse {
  id: string;
  companyName: string;
  roleTitle: string;
  employmentType: EmploymentType | null;
  location: string | null;
  remote: boolean;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  achievements: string[];
  technologies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateSkillResponse {
  id: string;
  skillId: string;
  name: string;
  normalizedName: string;
  category: SkillCategory | null;
  proficiencyLevel: ProficiencyLevel | null;
  yearsOfExperience: number | null;
  lastUsedYear: number | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}
