import { describe, expect, it } from 'vitest';
import { jobSourcesConfig } from './index';

describe('jobSourcesConfig', () => {
  it('starts with all sources disabled', () => {
    expect(jobSourcesConfig.enabled).toBe(false);
  });
});
