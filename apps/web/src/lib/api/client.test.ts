import { afterEach, describe, expect, it, vi } from 'vitest';
import { createJobPilotApiClient, JobPilotApiError, getUserFacingApiError } from '.';

describe('JobPilotApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the candidate profile', async () => {
    const fetchMock = mockJsonFetch({ id: 'profile-1', experiences: [], skills: [] });

    await expect(createJobPilotApiClient('http://api.test').getCandidateProfile()).resolves.toMatchObject({
      id: 'profile-1',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/candidate-profile',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('updates the candidate profile', async () => {
    const fetchMock = mockJsonFetch({ id: 'profile-1', headline: 'Engineer', experiences: [], skills: [] });

    await createJobPilotApiClient('http://api.test').updateCandidateProfile({ headline: 'Engineer' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/candidate-profile',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ headline: 'Engineer' }),
      }),
    );
  });

  it('creates and deletes experiences', async () => {
    const fetchMock = mockJsonFetch({ id: 'profile-1', experiences: [], skills: [] });
    const client = createJobPilotApiClient('http://api.test');

    await client.createExperience({
      companyName: 'Acme',
      roleTitle: 'Engineer',
      startDate: '2024-01-01' as unknown as Date,
      current: true,
      endDate: null,
    });
    await client.deleteExperience('exp-1');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://api.test/candidate-profile/experiences',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://api.test/candidate-profile/experiences/exp-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('creates skills and exposes duplicate skill errors', async () => {
    mockJsonFetch(
      {
        statusCode: 409,
        code: 'DUPLICATE_CANDIDATE_SKILL',
        message: 'Candidate skill already exists',
      },
      409,
    );

    await expect(
      createJobPilotApiClient('http://api.test').createSkill({
        name: 'TypeScript',
        proficiencyLevel: 'ADVANCED',
      }),
    ).rejects.toMatchObject({ code: 'DUPLICATE_CANDIDATE_SKILL' });
  });

  it('uploads resumes with multipart form data', async () => {
    const fetchMock = mockJsonFetch({ id: 'resume-1', originalFileName: 'resume.pdf' });
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });

    await createJobPilotApiClient('http://api.test').uploadResume(file);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/resumes/upload', expect.objectContaining({ method: 'POST' }));
    expect(init.body).toBeInstanceOf(FormData);
  });

  it('runs extraction and analysis actions through existing endpoints', async () => {
    const fetchMock = mockJsonFetch({ id: 'result-1' });
    const client = createJobPilotApiClient('http://api.test');

    await client.extractResume('resume-1');
    await client.analyzeResume('resume-1');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://api.test/resumes/resume-1/extract',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://api.test/resumes/resume-1/analyze',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('maps API unavailable and validation errors to user-facing messages', () => {
    expect(getUserFacingApiError(new TypeError('fetch failed'))).toContain('API is unavailable');
    expect(getUserFacingApiError(new JobPilotApiError(400, 'INVALID_INPUT', 'headline is invalid'))).toBe(
      'headline is invalid',
    );
  });
});

function mockJsonFetch(body: unknown, status: number = 200): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => {
    return new Response(status === 204 ? null : JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
