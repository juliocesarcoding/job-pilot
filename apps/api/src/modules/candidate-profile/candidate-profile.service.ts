import {
  CandidateProfileResponse,
  CandidateProfileUpsertInput,
  CandidateSkillCreateInput,
  CandidateSkillUpdateInput,
  ExperienceCreateInput,
  ExperienceUpdateInput,
} from '@job-pilot/shared';
import { Inject, Injectable } from '@nestjs/common';
import { mapCandidateProfile } from './candidate-profile.mapper';
import { DevelopmentUserService } from './development-user.service';
import { CandidateProfileError } from './domain/errors';
import {
  CANDIDATE_PROFILE_REPOSITORY,
  CandidateProfileRepository,
} from './repositories/candidate-profile.repository';

@Injectable()
export class CandidateProfileService {
  constructor(
    private readonly developmentUserService: DevelopmentUserService,
    @Inject(CANDIDATE_PROFILE_REPOSITORY)
    private readonly repository: CandidateProfileRepository,
  ) {}

  async getCurrentProfile(): Promise<CandidateProfileResponse> {
    const user = await this.developmentUserService.getCurrentUser();
    const profile = await this.repository.findProfileByUserId(user.id);

    if (!profile) {
      throw new CandidateProfileError('PROFILE_NOT_FOUND', 'Candidate profile was not found');
    }

    return mapCandidateProfile(profile);
  }

  async upsertCurrentProfile(input: CandidateProfileUpsertInput): Promise<CandidateProfileResponse> {
    const user = await this.developmentUserService.getCurrentUser();
    const profile = await this.repository.upsertProfile(user.id, input);

    return mapCandidateProfile(profile);
  }

  async createExperience(input: ExperienceCreateInput): Promise<CandidateProfileResponse> {
    const user = await this.developmentUserService.getCurrentUser();
    const profile = await this.repository.createExperience(user.id, input);

    if (!profile) {
      throw new CandidateProfileError('PROFILE_NOT_FOUND', 'Candidate profile was not found');
    }

    return mapCandidateProfile(profile);
  }

  async updateExperience(
    experienceId: string,
    input: ExperienceUpdateInput,
  ): Promise<CandidateProfileResponse> {
    const user = await this.developmentUserService.getCurrentUser();
    const profile = await this.repository.updateExperience(user.id, experienceId, input);

    if (!profile) {
      throw new CandidateProfileError('RESOURCE_NOT_FOUND', 'Experience was not found');
    }

    return mapCandidateProfile(profile);
  }

  async deleteExperience(experienceId: string): Promise<void> {
    const user = await this.developmentUserService.getCurrentUser();
    const deleted = await this.repository.softDeleteExperience(user.id, experienceId);

    if (!deleted) {
      throw new CandidateProfileError('RESOURCE_NOT_FOUND', 'Experience was not found');
    }
  }

  async addSkill(input: CandidateSkillCreateInput): Promise<CandidateProfileResponse> {
    const user = await this.developmentUserService.getCurrentUser();
    const result = await this.repository.addSkill(user.id, input);

    if (!result) {
      throw new CandidateProfileError('PROFILE_NOT_FOUND', 'Candidate profile was not found');
    }

    if (result.duplicate) {
      throw new CandidateProfileError('DUPLICATE_CANDIDATE_SKILL', 'Candidate skill already exists');
    }

    return mapCandidateProfile(result.profile);
  }

  async updateSkill(
    candidateSkillId: string,
    input: CandidateSkillUpdateInput,
  ): Promise<CandidateProfileResponse> {
    const user = await this.developmentUserService.getCurrentUser();
    const profile = await this.repository.updateCandidateSkill(user.id, candidateSkillId, input);

    if (!profile) {
      throw new CandidateProfileError('RESOURCE_NOT_FOUND', 'Candidate skill was not found');
    }

    return mapCandidateProfile(profile);
  }

  async deleteSkill(candidateSkillId: string): Promise<void> {
    const user = await this.developmentUserService.getCurrentUser();
    const deleted = await this.repository.deleteCandidateSkill(user.id, candidateSkillId);

    if (!deleted) {
      throw new CandidateProfileError('RESOURCE_NOT_FOUND', 'Candidate skill was not found');
    }
  }
}
