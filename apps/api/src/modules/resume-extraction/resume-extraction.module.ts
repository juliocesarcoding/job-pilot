import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ResumeExtractionController } from './resume-extraction.controller';
import { ResumeExtractionErrorFilter } from './resume-extraction-error.filter';
import { ResumeExtractionService } from './resume-extraction.service';
import {
  PrismaResumeExtractionRepository,
  RESUME_EXTRACTION_REPOSITORY,
} from './repositories/resume-extraction.repository';
import {
  RESUME_STORAGE_PROVIDER_TOKEN,
} from '../resume/storage/resume-storage.provider';
import { LocalResumeStorageProvider } from '../resume/storage/local-resume-storage.provider';

@Module({
  controllers: [ResumeExtractionController],
  providers: [
    ResumeExtractionService,
    {
      provide: RESUME_EXTRACTION_REPOSITORY,
      useClass: PrismaResumeExtractionRepository,
    },
    {
      provide: RESUME_STORAGE_PROVIDER_TOKEN,
      useClass: LocalResumeStorageProvider,
    },
    {
      provide: APP_FILTER,
      useClass: ResumeExtractionErrorFilter,
    },
  ],
})
export class ResumeExtractionModule {}
