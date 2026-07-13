export interface StoredResumeFile {
  storedFileName: string;
  storagePath: string;
}

export interface ResumeStorageProvider {
  save(input: {
    candidateProfileId: string;
    storedFileName: string;
    buffer: Buffer;
  }): Promise<StoredResumeFile>;
  delete(storagePath: string): Promise<void>;
  exists(storagePath: string): Promise<boolean>;
  read(storagePath: string): Promise<Buffer>;
  getPath(storagePath: string): string;
}

export const RESUME_STORAGE_PROVIDER_TOKEN = Symbol('RESUME_STORAGE_PROVIDER_TOKEN');
