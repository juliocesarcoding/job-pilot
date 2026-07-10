import { describe, expect, it } from 'vitest';
import { sharedConfig } from './index';

describe('sharedConfig', () => {
  it('exposes the shared workspace metadata', () => {
    expect(sharedConfig.appName).toBe('Job Pilot');
  });
});
