import { CandidateProfileAggregate, CandidateProfileRepository } from './repositories/candidate-profile.repository';
import { CandidateProfileService } from './candidate-profile.service';
import { CandidateProfileError } from './domain/errors';
import { DevelopmentUserService } from './development-user.service';
import { describe, expect, it } from 'vitest';
import { Prisma } from '@job-pilot/database';

const profile = createProfileAggregate();

class FakeDevelopmentUserService {
  async getCurrentUser(): Promise<{ id: string; email: string; name: string }> {
    return {
      id: 'user-1',
      email: 'dev@example.com',
      name: 'Dev User',
    };
  }
}

class FakeCandidateProfileRepository implements CandidateProfileRepository {
  duplicateSkill = false;
  experienceDeleted = true;
  skillDeleted = true;
  experienceUpdateFound = true;

  async findUserByEmail(): Promise<null> {
    return null;
  }

  async findProfileByUserId(): Promise<CandidateProfileAggregate | null> {
    return profile;
  }

  async upsertProfile(): Promise<CandidateProfileAggregate> {
    return profile;
  }

  async createExperience(): Promise<CandidateProfileAggregate | null> {
    return profile;
  }

  async updateExperience(): Promise<CandidateProfileAggregate | null> {
    return this.experienceUpdateFound ? profile : null;
  }

  async softDeleteExperience(): Promise<boolean> {
    return this.experienceDeleted;
  }

  async addSkill(): Promise<{ profile: CandidateProfileAggregate; duplicate: boolean } | null> {
    return {
      profile,
      duplicate: this.duplicateSkill,
    };
  }

  async updateCandidateSkill(): Promise<CandidateProfileAggregate | null> {
    return profile;
  }

  async deleteCandidateSkill(): Promise<boolean> {
    return this.skillDeleted;
  }
}

describe('CandidateProfileService', () => {
  it('creates or updates the current user profile', async () => {
    const { service } = createService();

    await expect(service.upsertCurrentProfile({ headline: 'Developer' })).resolves.toMatchObject({
      id: 'profile-1',
      headline: 'Developer',
    });
  });

  it('rejects duplicate candidate skills', async () => {
    const { service, repository } = createService();
    repository.duplicateSkill = true;

    await expect(service.addSkill({ name: 'TypeScript' })).rejects.toMatchObject({
      code: 'DUPLICATE_CANDIDATE_SKILL',
    });
  });

  it('rejects updates to experiences not owned by the current user', async () => {
    const { service, repository } = createService();
    repository.experienceUpdateFound = false;

    await expect(service.updateExperience('other-experience', {})).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });

  it('soft deletes experiences through the repository', async () => {
    const { service, repository } = createService();
    repository.experienceDeleted = false;

    await expect(service.deleteExperience('missing-experience')).rejects.toBeInstanceOf(
      CandidateProfileError,
    );
  });
});

function createService(): {
  service: CandidateProfileService;
  repository: FakeCandidateProfileRepository;
} {
  const repository = new FakeCandidateProfileRepository();
  const service = new CandidateProfileService(
    new FakeDevelopmentUserService() as DevelopmentUserService,
    repository,
  );

  return { service, repository };
}

function createProfileAggregate(): CandidateProfileAggregate {
  return {
    id: 'profile-1',
    userId: 'user-1',
    headline: 'Developer',
    summary: null,
    currentLocation: null,
    countryCode: null,
    timezone: null,
    englishLevel: null,
    yearsOfExperience: null,
    desiredRole: null,
    desiredSalaryMin: new Prisma.Decimal(100),
    desiredSalaryMax: new Prisma.Decimal(200),
    desiredSalaryCurrency: 'USD',
    remoteOnly: true,
    openToContract: true,
    openToFullTime: true,
    requiresVisaSponsorship: false,
    linkedinUrl: null,
    githubUrl: null,
    portfolioUrl: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    experiences: [],
    candidateSkills: [],
  } as unknown as CandidateProfileAggregate;
}
