import { PrismaClient } from '@prisma/client';
import { loadDatabaseEnv } from '../src/env';

loadDatabaseEnv();

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.upsert({
      where: { email: 'julio.dev@jobpilot.local' },
      update: {
        name: 'Julio Cesar',
        deletedAt: null,
      },
      create: {
        email: 'julio.dev@jobpilot.local',
        name: 'Julio Cesar',
      },
    });

    const profile = await transaction.candidateProfile.upsert({
      where: { userId: user.id },
      update: {
        headline: null,
        summary: null,
        currentLocation: null,
        countryCode: null,
        timezone: null,
        englishLevel: null,
        yearsOfExperience: null,
        desiredRole: null,
        desiredSalaryMin: null,
        desiredSalaryMax: null,
        desiredSalaryCurrency: null,
        remoteOnly: true,
        openToContract: true,
        openToFullTime: true,
        requiresVisaSponsorship: false,
        linkedinUrl: null,
        githubUrl: null,
        portfolioUrl: null,
        deletedAt: null,
      },
      create: {
        userId: user.id,
      },
    });

    await transaction.candidateSkill.deleteMany({
      where: {
        candidateProfileId: profile.id,
      },
    });

    await transaction.experience.deleteMany({
      where: {
        candidateProfileId: profile.id,
      },
    });
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
