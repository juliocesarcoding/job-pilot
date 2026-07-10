import { describe, expect, it, beforeEach, afterAll } from 'vitest';
import { prisma } from '@job-pilot/database';
import { PrismaCandidateProfileRepository } from './candidate-profile.repository';

const repository = new PrismaCandidateProfileRepository(prisma);

describe('PrismaCandidateProfileRepository', () => {
  beforeEach(async () => {
    await prisma.candidateSkill.deleteMany({
      where: {
        candidateProfile: {
          user: {
            email: {
              endsWith: '@repository.test',
            },
          },
        },
      },
    });
    await prisma.experience.deleteMany({
      where: {
        candidateProfile: {
          user: {
            email: {
              endsWith: '@repository.test',
            },
          },
        },
      },
    });
    await prisma.candidateProfile.deleteMany({
      where: {
        user: {
          email: {
            endsWith: '@repository.test',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: '@repository.test',
        },
      },
    });
    await prisma.skill.deleteMany({
      where: {
        normalizedName: {
          in: ['typescript'],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates and updates a candidate profile', async () => {
    const user = await createUser('profile@repository.test');

    const created = await repository.upsertProfile(user.id, {
      headline: 'Backend developer',
      desiredSalaryMin: 100,
      desiredSalaryMax: 200,
    });
    const updated = await repository.upsertProfile(user.id, {
      headline: 'Senior backend developer',
      desiredSalaryMin: 150,
      desiredSalaryMax: 250,
    });

    expect(created.headline).toBe('Backend developer');
    expect(updated.headline).toBe('Senior backend developer');
    expect(updated.desiredSalaryMin?.toNumber()).toBe(150);
  });

  it('creates, retrieves, and soft deletes an owned experience', async () => {
    const user = await createUserWithProfile('experience@repository.test');
    const withExperience = await repository.createExperience(user.id, {
      companyName: 'Acme',
      roleTitle: 'Engineer',
      startDate: new Date('2024-01-01'),
      technologies: ['TypeScript'],
    });

    const experienceId = withExperience?.experiences[0]?.id;
    const deleted = await repository.softDeleteExperience(user.id, experienceId ?? '');
    const profileAfterDelete = await repository.findProfileByUserId(user.id);

    expect(experienceId).toBeDefined();
    expect(deleted).toBe(true);
    expect(profileAfterDelete?.experiences).toHaveLength(0);
  });

  it('prevents updates to experiences owned by another user', async () => {
    const owner = await createUserWithProfile('owner@repository.test');
    const other = await createUserWithProfile('other@repository.test');
    const withExperience = await repository.createExperience(owner.id, {
      companyName: 'Acme',
      roleTitle: 'Engineer',
      startDate: new Date('2024-01-01'),
    });

    const updated = await repository.updateExperience(other.id, withExperience?.experiences[0]?.id ?? '', {
      roleTitle: 'Staff Engineer',
    });

    expect(updated).toBeNull();
  });

  it('normalizes skills and rejects duplicate candidate skills', async () => {
    const user = await createUserWithProfile('skill@repository.test');
    const first = await repository.addSkill(user.id, {
      name: ' TypeScript ',
      category: 'LANGUAGE',
      isPrimary: true,
    });
    const duplicate = await repository.addSkill(user.id, {
      name: 'typescript',
    });

    expect(first?.duplicate).toBe(false);
    expect(first?.profile.candidateSkills[0]?.skill.normalizedName).toBe('typescript');
    expect(duplicate?.duplicate).toBe(true);
  });
});

async function createUser(email: string): Promise<{ id: string }> {
  return prisma.user.create({
    data: {
      email,
      name: 'Repository Test',
    },
    select: {
      id: true,
    },
  });
}

async function createUserWithProfile(email: string): Promise<{ id: string }> {
  const user = await createUser(email);
  await prisma.candidateProfile.create({
    data: {
      userId: user.id,
    },
  });

  return user;
}
