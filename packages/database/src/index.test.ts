import { describe, expect, it } from 'vitest';
import { prisma } from './index';

describe('database package', () => {
  it('exports a prisma client', () => {
    expect(prisma).toBeDefined();
  });
});
