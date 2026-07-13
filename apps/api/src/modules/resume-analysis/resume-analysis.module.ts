import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { OpenAIResumeAnalysisProvider } from './providers/openai-resume-analysis.provider';
import { RESUME_ANALYSIS_PROVIDER } from './providers/resume-analysis.provider';
import {
  PrismaResumeAnalysisRepository,
  RESUME_ANALYSIS_REPOSITORY,
} from './repositories/resume-analysis.repository';
import { ResumeAnalysisController } from './resume-analysis.controller';
import { ResumeAnalysisErrorFilter } from './resume-analysis-error.filter';
import { ResumeAnalysisService } from './resume-analysis.service';

@Module({
  controllers: [ResumeAnalysisController],
  providers: [
    ResumeAnalysisService,
    {
      provide: RESUME_ANALYSIS_REPOSITORY,
      useClass: PrismaResumeAnalysisRepository,
    },
    {
      provide: RESUME_ANALYSIS_PROVIDER,
      useClass: OpenAIResumeAnalysisProvider,
    },
    {
      provide: APP_FILTER,
      useClass: ResumeAnalysisErrorFilter,
    },
  ],
})
export class ResumeAnalysisModule {}
