export interface ResumeAnalysisViewModel {
  summary: {
    headline: string | null;
    overview: string | null;
    seniority: string | null;
    confidence?: number | null;
  };
  skills: Array<{ name: string; category: string | null; evidence: string | null }>;
  experience: Array<{
    company: string | null;
    role: string | null;
    startDate: string | null;
    endDate: string | null;
    current: boolean | null;
    description: string | null;
    evidence: string | null;
  }>;
  education: Array<{
    institution: string | null;
    degree: string | null;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    evidence: string | null;
  }>;
  languages: Array<{ name: string; proficiency: string | null; evidence: string | null }>;
  certifications: Array<{
    name: string;
    issuer: string | null;
    issueDate: string | null;
    expirationDate: string | null;
    evidence: string | null;
  }>;
}

export function toResumeAnalysisViewModel(value: unknown): ResumeAnalysisViewModel | null {
  if (!isRecord(value)) {
    return null;
  }

  const summary = value.summary;

  if (!isRecord(summary)) {
    return null;
  }

  return {
    summary: {
      headline: nullableString(summary.headline),
      overview: nullableString(summary.overview),
      seniority: nullableString(summary.seniority),
      confidence: nullableNumber(summary.confidence),
    },
    skills: arrayValue(value.skills).map((item) => ({
      name: stringValue(item.name),
      category: nullableString(item.category),
      evidence: nullableString(item.evidence),
    })),
    experience: arrayValue(value.experience).map((item) => ({
      company: nullableString(item.company),
      role: nullableString(item.role),
      startDate: nullableString(item.startDate),
      endDate: nullableString(item.endDate),
      current: nullableBoolean(item.current),
      description: nullableString(item.description),
      evidence: nullableString(item.evidence),
    })),
    education: arrayValue(value.education).map((item) => ({
      institution: nullableString(item.institution),
      degree: nullableString(item.degree),
      field: nullableString(item.field),
      startDate: nullableString(item.startDate),
      endDate: nullableString(item.endDate),
      evidence: nullableString(item.evidence),
    })),
    languages: arrayValue(value.languages).map((item) => ({
      name: stringValue(item.name),
      proficiency: nullableString(item.proficiency),
      evidence: nullableString(item.evidence),
    })),
    certifications: arrayValue(value.certifications).map((item) => ({
      name: stringValue(item.name),
      issuer: nullableString(item.issuer),
      issueDate: nullableString(item.issueDate),
      expirationDate: nullableString(item.expirationDate),
      evidence: nullableString(item.evidence),
    })),
  };
}

function arrayValue(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function stringValue(value: unknown): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : 'Unknown';
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function nullableBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
