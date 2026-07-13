import { Module } from '@nestjs/common';
import { CandidateProfileModule } from './modules/candidate-profile/candidate-profile.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { ResumeModule } from './modules/resume/resume.module';
import { ResumeExtractionModule } from './modules/resume-extraction/resume-extraction.module';
import { ResumeAnalysisModule } from './modules/resume-analysis/resume-analysis.module';

@Module({
  imports: [CandidateProfileModule, ResumeModule, ResumeExtractionModule, ResumeAnalysisModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}
