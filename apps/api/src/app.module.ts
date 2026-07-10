import { Module } from '@nestjs/common';
import { CandidateProfileModule } from './modules/candidate-profile/candidate-profile.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';

@Module({
  imports: [CandidateProfileModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}
