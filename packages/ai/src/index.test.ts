import { describe, expect, it } from 'vitest';
import { aiConfig } from './index';

describe('aiConfig', () => {
  it('exposes the placeholder AI configuration', () => {
    expect(aiConfig.enabled).toBe(false);
  });
});
