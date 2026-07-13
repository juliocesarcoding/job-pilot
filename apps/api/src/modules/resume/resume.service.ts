import {
  ResumeResponse,
  ResumeUploadFile,
  calculateResumeChecksum,
  generateResumeStoredFileName,
  validateResumeUploadFile,
} from '@job-pilot/shared';
import { Inject, Injectable } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { ReadStream } from 'node:fs';
import { loadApiEnv } from '../../config/env';
import { ResumeError } from './domain/errors';
import { mapResume } from './resume.mapper';
import { RESUME_REPOSITORY, ResumeRepository } from './repositories/resume.repository';
import {
  RESUME_STORAGE_PROVIDER_TOKEN,
  ResumeStorageProvider,
} from './storage/resume-storage.provider';

export interface ResumeDownload {
  resume: ResumeResponse;
  stream: ReadStream;
}

@Injectable()
export class ResumeService {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly repository: ResumeRepository,
    @Inject(RESUME_STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: ResumeStorageProvider,
  ) {}

  async listResumes(): Promise<ResumeResponse[]> {
    const profile = await this.getCurrentCandidateProfile();
    const resumes = await this.repository.listByCandidateProfile(profile.id);

    return resumes.map(mapResume);
  }

  async getActiveResume(): Promise<ResumeResponse> {
    const profile = await this.getCurrentCandidateProfile();
    const resume = await this.repository.findActiveByCandidateProfile(profile.id);

    if (!resume) {
      throw new ResumeError('RESUME_NOT_FOUND', 'Active resume was not found');
    }

    return mapResume(resume);
  }

  async uploadResume(file: ResumeUploadFile | undefined): Promise<ResumeResponse> {
    const profile = await this.getCurrentCandidateProfile();
    if (!file) {
      throw new ResumeError('INVALID_RESUME_UPLOAD', 'Resume file is required');
    }

    const validation = this.validateFile(file);
    const storedFileName = generateResumeStoredFileName(validation.extension);
    const checksum = calculateResumeChecksum(file.buffer);
    const stored = await this.storageProvider.save({
      candidateProfileId: profile.id,
      storedFileName,
      buffer: file.buffer,
    });

    try {
      const resume = await this.repository.createNewVersion({
        candidateProfileId: profile.id,
        originalFileName: file.originalFileName,
        storedFileName: stored.storedFileName,
        mimeType: validation.mimeType,
        extension: validation.extension,
        fileSize: file.size,
        storagePath: stored.storagePath,
        checksum,
      });

      return mapResume(resume);
    } catch (error: unknown) {
      await this.storageProvider.delete(stored.storagePath);
      throw error;
    }
  }

  async downloadResume(resumeId: string): Promise<ResumeDownload> {
    const profile = await this.getCurrentCandidateProfile();
    const resume = await this.repository.findOwnedResume(profile.id, resumeId);

    if (!resume) {
      throw new ResumeError('RESUME_NOT_FOUND', 'Resume was not found');
    }

    if (!(await this.storageProvider.exists(resume.storagePath))) {
      throw new ResumeError('RESUME_NOT_FOUND', 'Resume file was not found');
    }

    return {
      resume: mapResume(resume),
      stream: createReadStream(this.storageProvider.getPath(resume.storagePath)),
    };
  }

  async deleteResume(resumeId: string): Promise<void> {
    const profile = await this.getCurrentCandidateProfile();
    const resume = await this.repository.findOwnedResume(profile.id, resumeId);

    if (!resume) {
      throw new ResumeError('RESUME_NOT_FOUND', 'Resume was not found');
    }

    const available = await this.repository.listByCandidateProfile(profile.id);

    if (resume.active && available.length === 1) {
      throw new ResumeError('RESUME_DELETE_NOT_ALLOWED', 'The only active resume cannot be deleted');
    }

    await this.repository.softDelete(profile.id, resume.id);
  }

  private validateFile(file: ResumeUploadFile | undefined): ReturnType<typeof validateResumeUploadFile> {
    try {
      return validateResumeUploadFile(file);
    } catch (error: unknown) {
      throw new ResumeError(
        'INVALID_RESUME_UPLOAD',
        error instanceof Error ? error.message : 'Resume upload is invalid',
      );
    }
  }

  private async getCurrentCandidateProfile(): Promise<{ id: string; userId: string }> {
    const env = loadApiEnv(process.env);
    const profile = await this.repository.findCandidateProfileByUserEmail(env.JOBPILOT_DEV_USER_EMAIL);

    if (!profile) {
      throw new ResumeError('CANDIDATE_PROFILE_NOT_FOUND', 'Candidate profile was not found');
    }

    return profile;
  }
}
