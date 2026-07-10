import {
  CandidateProfileUpsertInput,
  CandidateSkillCreateInput,
  CandidateSkillUpdateInput,
  ExperienceCreateInput,
  ExperienceUpdateInput,
  normalizeSkillName,
} from '@job-pilot/shared';
import { Prisma, PrismaClient, User, prisma } from '@job-pilot/database';
import { CandidateProfileError } from '../domain/errors';

export const CANDIDATE_PROFILE_REPOSITORY = Symbol('CANDIDATE_PROFILE_REPOSITORY');

export type CandidateProfileAggregate = Prisma.CandidateProfileGetPayload<{
  include: {
    experiences: true;
    candidateSkills: {
      include: {
        skill: true;
      };
    };
  };
}>;

export interface CandidateProfileRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findProfileByUserId(userId: string): Promise<CandidateProfileAggregate | null>;
  upsertProfile(userId: string, input: CandidateProfileUpsertInput): Promise<CandidateProfileAggregate>;
  createExperience(
    userId: string,
    input: ExperienceCreateInput,
  ): Promise<CandidateProfileAggregate | null>;
  updateExperience(
    userId: string,
    experienceId: string,
    input: ExperienceUpdateInput,
  ): Promise<CandidateProfileAggregate | null>;
  softDeleteExperience(userId: string, experienceId: string): Promise<boolean>;
  addSkill(
    userId: string,
    input: CandidateSkillCreateInput,
  ): Promise<{ profile: CandidateProfileAggregate; duplicate: boolean } | null>;
  updateCandidateSkill(
    userId: string,
    candidateSkillId: string,
    input: CandidateSkillUpdateInput,
  ): Promise<CandidateProfileAggregate | null>;
  deleteCandidateSkill(userId: string, candidateSkillId: string): Promise<boolean>;
}

export class PrismaCandidateProfileRepository implements CandidateProfileRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.client.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findProfileByUserId(userId: string): Promise<CandidateProfileAggregate | null> {
    return this.client.candidateProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      include: this.profileInclude(),
    });
  }

  async upsertProfile(
    userId: string,
    input: CandidateProfileUpsertInput,
  ): Promise<CandidateProfileAggregate> {
    await this.client.candidateProfile.upsert({
      where: { userId },
      update: {
        ...input,
        deletedAt: null,
      },
      create: {
        userId,
        ...input,
      },
    });

    const profile = await this.findProfileByUserId(userId);

    if (!profile) {
      throw new Error('Candidate profile upsert did not return a profile');
    }

    return profile;
  }

  async createExperience(
    userId: string,
    input: ExperienceCreateInput,
  ): Promise<CandidateProfileAggregate | null> {
    return this.client.$transaction(async (transaction) => {
      const profile = await this.findProfileByUserIdInTransaction(transaction, userId);

      if (!profile) {
        return null;
      }

      await transaction.experience.create({
        data: {
          candidateProfileId: profile.id,
          ...input,
          remote: input.remote ?? false,
          current: input.current ?? false,
          endDate: input.endDate ?? null,
          achievements: input.achievements ?? [],
          technologies: input.technologies ?? [],
        },
      });

      return this.findProfileByUserIdInTransaction(transaction, userId);
    });
  }

  async updateExperience(
    userId: string,
    experienceId: string,
    input: ExperienceUpdateInput,
  ): Promise<CandidateProfileAggregate | null> {
    return this.client.$transaction(async (transaction) => {
      const owned = await transaction.experience.findFirst({
        where: {
          id: experienceId,
          deletedAt: null,
          candidateProfile: {
            userId,
            deletedAt: null,
          },
        },
      });

      if (!owned) {
        return null;
      }

      const nextCurrent = input.current ?? owned.current;
      const nextStartDate = input.startDate ?? owned.startDate;
      const nextEndDate = nextCurrent ? null : input.endDate === undefined ? owned.endDate : input.endDate;

      if (nextEndDate !== null && nextEndDate < nextStartDate) {
        throw new CandidateProfileError('INVALID_INPUT', 'endDate cannot be before startDate');
      }

      await transaction.experience.update({
        where: { id: experienceId },
        data: {
          ...input,
          endDate: nextEndDate,
        },
      });

      return this.findProfileByUserIdInTransaction(transaction, userId);
    });
  }

  async softDeleteExperience(userId: string, experienceId: string): Promise<boolean> {
    const result = await this.client.experience.updateMany({
      where: {
        id: experienceId,
        deletedAt: null,
        candidateProfile: {
          userId,
          deletedAt: null,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count === 1;
  }

  async addSkill(
    userId: string,
    input: CandidateSkillCreateInput,
  ): Promise<{ profile: CandidateProfileAggregate; duplicate: boolean } | null> {
    return this.client.$transaction(async (transaction) => {
      const profile = await this.findProfileByUserIdInTransaction(transaction, userId);

      if (!profile) {
        return null;
      }

      const normalizedName = normalizeSkillName(input.name);
      const skill = await transaction.skill.upsert({
        where: { normalizedName },
        update: {
          name: input.name.trim(),
          category: input.category ?? undefined,
        },
        create: {
          name: input.name.trim(),
          normalizedName,
          category: input.category ?? null,
        },
      });

      const existing = await transaction.candidateSkill.findUnique({
        where: {
          candidateProfileId_skillId: {
            candidateProfileId: profile.id,
            skillId: skill.id,
          },
        },
      });

      if (existing) {
        const currentProfile = await this.findProfileByUserIdInTransaction(transaction, userId);

        if (!currentProfile) {
          return null;
        }

        return {
          profile: currentProfile,
          duplicate: true,
        };
      }

      await transaction.candidateSkill.create({
        data: {
          candidateProfileId: profile.id,
          skillId: skill.id,
          proficiencyLevel: input.proficiencyLevel ?? null,
          yearsOfExperience: input.yearsOfExperience ?? null,
          lastUsedYear: input.lastUsedYear ?? null,
          isPrimary: input.isPrimary ?? false,
        },
      });

      const currentProfile = await this.findProfileByUserIdInTransaction(transaction, userId);

      if (!currentProfile) {
        return null;
      }

      return {
        profile: currentProfile,
        duplicate: false,
      };
    });
  }

  async updateCandidateSkill(
    userId: string,
    candidateSkillId: string,
    input: CandidateSkillUpdateInput,
  ): Promise<CandidateProfileAggregate | null> {
    return this.client.$transaction(async (transaction) => {
      const owned = await transaction.candidateSkill.findFirst({
        where: {
          id: candidateSkillId,
          candidateProfile: {
            userId,
            deletedAt: null,
          },
        },
      });

      if (!owned) {
        return null;
      }

      await transaction.candidateSkill.update({
        where: { id: candidateSkillId },
        data: input,
      });

      return this.findProfileByUserIdInTransaction(transaction, userId);
    });
  }

  async deleteCandidateSkill(userId: string, candidateSkillId: string): Promise<boolean> {
    const result = await this.client.candidateSkill.deleteMany({
      where: {
        id: candidateSkillId,
        candidateProfile: {
          userId,
          deletedAt: null,
        },
      },
    });

    return result.count === 1;
  }

  private profileInclude(): {
    experiences: {
      where: { deletedAt: null };
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }];
    };
    candidateSkills: {
      include: {
        skill: true;
      };
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }];
    };
  } {
    return {
      experiences: {
        where: { deletedAt: null },
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      },
      candidateSkills: {
        include: {
          skill: true,
        },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
    };
  }

  private async findProfileByUserIdInTransaction(
    transaction: Prisma.TransactionClient,
    userId: string,
  ): Promise<CandidateProfileAggregate | null> {
    return transaction.candidateProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      include: this.profileInclude(),
    });
  }
}
