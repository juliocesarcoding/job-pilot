import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CandidateProfileController } from './candidate-profile.controller';
import { CandidateProfileErrorFilter } from './candidate-profile-error.filter';
import { CandidateProfileService } from './candidate-profile.service';
import { DevelopmentUserService } from './development-user.service';
import {
  CANDIDATE_PROFILE_REPOSITORY,
  PrismaCandidateProfileRepository,
} from './repositories/candidate-profile.repository';

@Module({
  controllers: [CandidateProfileController],
  providers: [
    CandidateProfileService,
    DevelopmentUserService,
    {
      provide: CANDIDATE_PROFILE_REPOSITORY,
      useClass: PrismaCandidateProfileRepository,
    },
    {
      provide: APP_FILTER,
      useClass: CandidateProfileErrorFilter,
    },
  ],
})
export class CandidateProfileModule {}
