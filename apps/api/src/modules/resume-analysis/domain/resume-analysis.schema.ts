import { z } from 'zod';

const nullableText = z.string().min(1).nullable();

export const resumeAnalysisSchema = z
  .object({
    summary: z.object({
      headline: nullableText,
      overview: nullableText,
      seniority: nullableText,
      confidence: z.number().min(0).max(1).nullable().optional(),
    }),
    skills: z.array(
      z.object({
        name: z.string().min(1),
        category: nullableText,
        evidence: nullableText,
      }),
    ),
    experience: z.array(
      z.object({
        company: nullableText,
        role: nullableText,
        startDate: nullableText,
        endDate: nullableText,
        current: z.boolean().nullable(),
        description: nullableText,
        evidence: nullableText,
      }),
    ),
    education: z.array(
      z.object({
        institution: nullableText,
        degree: nullableText,
        field: nullableText,
        startDate: nullableText,
        endDate: nullableText,
        evidence: nullableText,
      }),
    ),
    languages: z.array(
      z.object({
        name: z.string().min(1),
        proficiency: nullableText,
        evidence: nullableText,
      }),
    ),
    certifications: z.array(
      z.object({
        name: z.string().min(1),
        issuer: nullableText,
        issueDate: nullableText,
        expirationDate: nullableText,
        evidence: nullableText,
      }),
    ),
  })
  .strict();

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;

export function validateResumeAnalysis(value: unknown): ResumeAnalysis {
  return resumeAnalysisSchema.parse(value);
}
