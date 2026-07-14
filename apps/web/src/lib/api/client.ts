import type {
  CandidateProfileResponse,
  CandidateProfileUpsertInput,
  CandidateSkillCreateInput,
  CandidateSkillUpdateInput,
  ExperienceCreateInput,
  ExperienceUpdateInput,
  ResumeAnalysisResponse,
  ResumeExtractionResponse,
  ResumeResponse,
} from '@job-pilot/shared';
import { JobPilotApiError, type ApiErrorBody } from './errors';

const defaultBaseUrl = 'http://localhost:3001/api';

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultBaseUrl).replace(/\/$/, '');
}

export interface JobPilotApiClient {
  getCandidateProfile(): Promise<CandidateProfileResponse>;
  updateCandidateProfile(input: CandidateProfileUpsertInput): Promise<CandidateProfileResponse>;
  createExperience(input: ExperienceCreateInput): Promise<CandidateProfileResponse>;
  updateExperience(id: string, input: ExperienceUpdateInput): Promise<CandidateProfileResponse>;
  deleteExperience(id: string): Promise<void>;
  createSkill(input: CandidateSkillCreateInput): Promise<CandidateProfileResponse>;
  updateSkill(id: string, input: CandidateSkillUpdateInput): Promise<CandidateProfileResponse>;
  deleteSkill(id: string): Promise<void>;
  listResumes(): Promise<ResumeResponse[]>;
  getActiveResume(): Promise<ResumeResponse>;
  uploadResume(file: File): Promise<ResumeResponse>;
  deleteResume(id: string): Promise<void>;
  extractResume(id: string): Promise<ResumeExtractionResponse>;
  getResumeExtraction(id: string): Promise<ResumeExtractionResponse>;
  analyzeResume(id: string): Promise<ResumeAnalysisResponse>;
  getResumeAnalysis(id: string): Promise<ResumeAnalysisResponse>;
}

export function createJobPilotApiClient(baseUrl: string = getApiBaseUrl()): JobPilotApiClient {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...init.headers,
      },
      cache: 'no-store',
    });

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      throw await toApiError(response);
    }

    return (await response.json()) as T;
  }

  function jsonRequest<T>(path: string, method: 'POST' | 'PUT', body: unknown): Promise<T> {
    return request<T>(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  return {
    getCandidateProfile: () => request<CandidateProfileResponse>('/candidate-profile'),
    updateCandidateProfile: (input) => jsonRequest('/candidate-profile', 'PUT', input),
    createExperience: (input) => jsonRequest('/candidate-profile/experiences', 'POST', input),
    updateExperience: (id, input) => jsonRequest(`/candidate-profile/experiences/${id}`, 'PUT', input),
    deleteExperience: (id) => request<void>(`/candidate-profile/experiences/${id}`, { method: 'DELETE' }),
    createSkill: (input) => jsonRequest('/candidate-profile/skills', 'POST', input),
    updateSkill: (id, input) => jsonRequest(`/candidate-profile/skills/${id}`, 'PUT', input),
    deleteSkill: (id) => request<void>(`/candidate-profile/skills/${id}`, { method: 'DELETE' }),
    listResumes: () => request<ResumeResponse[]>('/resumes'),
    getActiveResume: () => request<ResumeResponse>('/resumes/active'),
    uploadResume: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<ResumeResponse>('/resumes/upload', {
        method: 'POST',
        body: formData,
      });
    },
    deleteResume: (id) => request<void>(`/resumes/${id}`, { method: 'DELETE' }),
    extractResume: (id) => request<ResumeExtractionResponse>(`/resumes/${id}/extract`, { method: 'POST' }),
    getResumeExtraction: (id) => request<ResumeExtractionResponse>(`/resumes/${id}/extraction`),
    analyzeResume: (id) => request<ResumeAnalysisResponse>(`/resumes/${id}/analyze`, { method: 'POST' }),
    getResumeAnalysis: (id) => request<ResumeAnalysisResponse>(`/resumes/${id}/analysis`),
  };
}

async function toApiError(response: Response): Promise<JobPilotApiError> {
  const body = await parseErrorBody(response);
  const message = Array.isArray(body.message) ? body.message.join('; ') : body.message;

  return new JobPilotApiError(
    response.status,
    body.code ?? `HTTP_${response.status}`,
    message ?? `API request failed with status ${response.status}`,
  );
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}
