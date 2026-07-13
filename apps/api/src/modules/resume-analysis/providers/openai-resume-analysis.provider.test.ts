import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAIResumeAnalysisProvider } from './openai-resume-analysis.provider';

describe('OpenAIResumeAnalysisProvider', () => {
  const originalFetch = globalThis.fetch;
  let originalApiKey: string | undefined;
  let originalModel: string | undefined;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalApiKey = process.env.OPENAI_API_KEY;
    originalModel = process.env.OPENAI_MODEL;
    originalNodeEnv = process.env.NODE_ENV;
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_MODEL = 'test-model';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    restoreEnv('OPENAI_API_KEY', originalApiKey);
    restoreEnv('OPENAI_MODEL', originalModel);
    restoreEnv('NODE_ENV', originalNodeEnv);
  });

  it('calls OpenAI and returns parsed analysis with token usage', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        output_text: JSON.stringify(createValidAnalysis()),
        usage: {
          input_tokens: 10,
          output_tokens: 20,
          total_tokens: 30,
        },
      }),
    } as Response);

    const result = await new OpenAIResumeAnalysisProvider().analyze({
      extractedText: 'TypeScript engineer',
      language: 'en',
      metadata: null,
    });

    expect(result.provider).toBe('openai');
    expect(result.model).toBe('test-model');
    expect(result.inputTokens).toBe(10);
    expect(result.analysis).toEqual(createValidAnalysis());
    const requestBody = JSON.parse(String(vi.mocked(globalThis.fetch).mock.calls[0][1]?.body)) as {
      text?: { format?: { type?: string; name?: string } };
    };
    expect(requestBody.text?.format?.type).toBe('json_schema');
    expect(requestBody.text?.format?.name).toBe('resume_analysis');
  });

  it('surfaces provider failures', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        error: {
          code: 'model_not_found',
          message: 'The model does not exist',
        },
      }),
    } as Response);

    await expect(
      new OpenAIResumeAnalysisProvider().analyze({
        extractedText: 'resume',
        language: null,
        metadata: null,
      }),
    ).rejects.toThrow('OpenAI provider failed with status 404 model_not_found');
  });
});

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function createValidAnalysis(): unknown {
  return {
    summary: {
      headline: 'Senior Engineer',
      overview: 'Builds APIs.',
      seniority: 'senior',
      confidence: 0.8,
    },
    skills: [{ name: 'TypeScript', category: 'LANGUAGE', evidence: 'TypeScript' }],
    experience: [],
    education: [],
    languages: [],
    certifications: [],
  };
}
