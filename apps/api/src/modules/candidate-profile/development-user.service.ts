import { Inject, Injectable } from '@nestjs/common';
import { loadApiEnv } from '../../config/env';
import { CurrentDevelopmentUser } from './domain/current-user';
import { CandidateProfileError } from './domain/errors';
import {
  CANDIDATE_PROFILE_REPOSITORY,
  CandidateProfileRepository,
} from './repositories/candidate-profile.repository';

@Injectable()
export class DevelopmentUserService {
  constructor(
    @Inject(CANDIDATE_PROFILE_REPOSITORY)
    private readonly repository: CandidateProfileRepository,
  ) {}

  async getCurrentUser(): Promise<CurrentDevelopmentUser> {
    const env = loadApiEnv(process.env);
    const user = await this.repository.findUserByEmail(env.JOBPILOT_DEV_USER_EMAIL);

    if (!user) {
      throw new CandidateProfileError(
        'USER_NOT_FOUND',
        `Development user ${env.JOBPILOT_DEV_USER_EMAIL} was not found. Run the database seed.`,
      );
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
