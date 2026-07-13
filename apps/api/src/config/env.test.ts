import { describe, expect, it } from 'vitest';
import { loadApiEnv } from './env';

describe('loadApiEnv', () => {
  it('loads the API environment with defaults', () => {
    const env = loadApiEnv({
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/jobpilot',
      REDIS_URL: 'redis://localhost:6379',
      OPENAI_API_KEY: 'test-key',
      OPENAI_MODEL: 'test-model',
      NODE_ENV: 'development',
    });

    expect(env.PORT).toBe(3001);
    expect(env.NODE_ENV).toBe('development');
    expect(env.DATABASE_URL).toContain('postgresql');
  });

  it('throws useful messages for invalid values', () => {
    expect(() =>
      loadApiEnv({
        DATABASE_URL: '',
        REDIS_URL: 'not-a-url',
        PORT: '70000',
        OPENAI_API_KEY: '',
        OPENAI_MODEL: '',
        NODE_ENV: 'development',
      }),
    ).toThrow(
      'Invalid API environment: PORT must be between 1 and 65535; DATABASE_URL is required; REDIS_URL must be a valid URL; OPENAI_API_KEY is required; OPENAI_MODEL is required',
    );
  });
});
