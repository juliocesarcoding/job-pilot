import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ResumeController } from './resume.controller';
import { ResumeErrorFilter } from './resume-error.filter';
import { ResumeService } from './resume.service';
import { RESUME_REPOSITORY, PrismaResumeRepository } from './repositories/resume.repository';
import {
  RESUME_STORAGE_PROVIDER_TOKEN,
} from './storage/resume-storage.provider';
import { LocalResumeStorageProvider } from './storage/local-resume-storage.provider';

@Module({
  controllers: [ResumeController],
  providers: [
    ResumeService,
    {
      provide: RESUME_REPOSITORY,
      useClass: PrismaResumeRepository,
    },
    {
      provide: RESUME_STORAGE_PROVIDER_TOKEN,
      useClass: LocalResumeStorageProvider,
    },
    {
      provide: APP_FILTER,
      useClass: ResumeErrorFilter,
    },
  ],
})
export class ResumeModule {}
