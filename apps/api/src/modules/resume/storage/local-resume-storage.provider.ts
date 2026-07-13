import { buildResumeStoragePath } from '@job-pilot/shared';
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, parse } from 'node:path';
import { loadApiEnv } from '../../../config/env';
import { ResumeStorageProvider, StoredResumeFile } from './resume-storage.provider';

export class LocalResumeStorageProvider implements ResumeStorageProvider {
  private readonly basePath: string;

  constructor(basePath: string = loadApiEnv(process.env).RESUME_STORAGE_PATH) {
    this.basePath = isAbsolute(basePath)
      ? normalize(basePath)
      : normalize(join(findWorkspaceRoot(process.cwd()), basePath));
  }

  async save(input: {
    candidateProfileId: string;
    storedFileName: string;
    buffer: Buffer;
  }): Promise<StoredResumeFile> {
    const storagePath = buildResumeStoragePath(input.candidateProfileId, input.storedFileName);
    const fullPath = this.getPath(storagePath);

    await fs.mkdir(dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, input.buffer, { flag: 'wx' });

    return {
      storedFileName: input.storedFileName,
      storagePath,
    };
  }

  async delete(storagePath: string): Promise<void> {
    await fs.rm(this.getPath(storagePath), { force: true });
  }

  async exists(storagePath: string): Promise<boolean> {
    try {
      await fs.access(this.getPath(storagePath));
      return true;
    } catch {
      return false;
    }
  }

  async read(storagePath: string): Promise<Buffer> {
    return fs.readFile(this.getPath(storagePath));
  }

  getPath(storagePath: string): string {
    const fullPath = normalize(join(this.basePath, storagePath));

    if (!fullPath.startsWith(this.basePath)) {
      throw new Error('Invalid resume storage path');
    }

    return fullPath;
  }
}

function findWorkspaceRoot(startDirectory: string): string {
  let currentDirectory = startDirectory;

  while (true) {
    if (existsSync(join(currentDirectory, 'pnpm-workspace.yaml'))) {
      return currentDirectory;
    }

    const parentDirectory = dirname(currentDirectory);

    if (parentDirectory === currentDirectory || currentDirectory === parse(currentDirectory).root) {
      return startDirectory;
    }

    currentDirectory = parentDirectory;
  }
}
