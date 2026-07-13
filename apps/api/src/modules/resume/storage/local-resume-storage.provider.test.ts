import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import { LocalResumeStorageProvider } from './local-resume-storage.provider';

let storageRoot: string | undefined;

describe('LocalResumeStorageProvider', () => {
  afterEach(async () => {
    if (storageRoot) {
      await rm(storageRoot, { recursive: true, force: true });
      storageRoot = undefined;
    }
  });

  it('saves files under the candidate profile directory', async () => {
    storageRoot = await mkdtemp(join(tmpdir(), 'job-pilot-resume-storage-'));
    const provider = new LocalResumeStorageProvider(storageRoot);

    const stored = await provider.save({
      candidateProfileId: 'candidate-1',
      storedFileName: 'generated.pdf',
      buffer: Buffer.from('PDF'),
    });

    expect(stored.storagePath).toBe('candidate-1/generated.pdf');
    await expect(readFile(provider.getPath(stored.storagePath), 'utf8')).resolves.toBe('PDF');
    await expect(provider.exists(stored.storagePath)).resolves.toBe(true);
  });
});
