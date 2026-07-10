import { describe, expect, it } from 'vitest';
import { loadWorkerEnv } from './env';

describe('loadWorkerEnv', () => {
  it('loads worker environment values', () => {
    const env = loadWorkerEnv({
      REDIS_URL: 'redis://localhost:6379',
      QUEUE_NAME: 'job-pilot-test',
    });

    expect(env.REDIS_URL).toContain('redis');
    expect(env.QUEUE_NAME).toBe('job-pilot-test');
  });

  it('throws useful messages for invalid values', () => {
    expect(() =>
      loadWorkerEnv({
        REDIS_URL: 'not-a-url',
      }),
    ).toThrow('Invalid worker environment: REDIS_URL must be a valid URL');
  });
});
