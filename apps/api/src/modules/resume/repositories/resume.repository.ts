import { Prisma, PrismaClient, prisma } from '@job-pilot/database';

export const RESUME_REPOSITORY = Symbol('RESUME_REPOSITORY');

export type ResumeRecord = Prisma.ResumeGetPayload<Record<string, never>>;

export interface CandidateProfileIdentity {
  id: string;
  userId: string;
}

export interface ResumeCreateMetadata {
  candidateProfileId: string;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  extension: string;
  fileSize: number;
  storagePath: string;
  checksum: string;
}

export interface ResumeRepository {
  findCandidateProfileByUserEmail(email: string): Promise<CandidateProfileIdentity | null>;
  listByCandidateProfile(candidateProfileId: string): Promise<ResumeRecord[]>;
  findActiveByCandidateProfile(candidateProfileId: string): Promise<ResumeRecord | null>;
  findOwnedResume(candidateProfileId: string, resumeId: string): Promise<ResumeRecord | null>;
  createNewVersion(metadata: ResumeCreateMetadata): Promise<ResumeRecord>;
  softDelete(candidateProfileId: string, resumeId: string): Promise<ResumeRecord | null>;
}

export class PrismaResumeRepository implements ResumeRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async findCandidateProfileByUserEmail(email: string): Promise<CandidateProfileIdentity | null> {
    return this.client.candidateProfile.findFirst({
      where: {
        deletedAt: null,
        user: {
          email,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });
  }

  async listByCandidateProfile(candidateProfileId: string): Promise<ResumeRecord[]> {
    return this.client.resume.findMany({
      where: {
        candidateProfileId,
        deletedAt: null,
      },
      orderBy: {
        version: 'desc',
      },
    });
  }

  async findActiveByCandidateProfile(candidateProfileId: string): Promise<ResumeRecord | null> {
    return this.client.resume.findFirst({
      where: {
        candidateProfileId,
        active: true,
        deletedAt: null,
      },
    });
  }

  async findOwnedResume(candidateProfileId: string, resumeId: string): Promise<ResumeRecord | null> {
    return this.client.resume.findFirst({
      where: {
        id: resumeId,
        candidateProfileId,
        deletedAt: null,
      },
    });
  }

  async createNewVersion(metadata: ResumeCreateMetadata): Promise<ResumeRecord> {
    return this.client.$transaction(async (transaction) => {
      const latest = await transaction.resume.findFirst({
        where: {
          candidateProfileId: metadata.candidateProfileId,
        },
        orderBy: {
          version: 'desc',
        },
      });
      const nextVersion = (latest?.version ?? 0) + 1;

      await transaction.resume.updateMany({
        where: {
          candidateProfileId: metadata.candidateProfileId,
          active: true,
          deletedAt: null,
        },
        data: {
          active: false,
        },
      });

      return transaction.resume.create({
        data: {
          ...metadata,
          storageProvider: 'LOCAL',
          version: nextVersion,
          uploadedAt: new Date(),
          active: true,
        },
      });
    });
  }

  async softDelete(candidateProfileId: string, resumeId: string): Promise<ResumeRecord | null> {
    return this.client.$transaction(async (transaction) => {
      const target = await transaction.resume.findFirst({
        where: {
          id: resumeId,
          candidateProfileId,
          deletedAt: null,
        },
      });

      if (!target) {
        return null;
      }

      await transaction.resume.update({
        where: { id: target.id },
        data: {
          active: false,
          deletedAt: new Date(),
        },
      });

      if (target.active) {
        const previous = await transaction.resume.findFirst({
          where: {
            candidateProfileId,
            deletedAt: null,
            id: {
              not: target.id,
            },
          },
          orderBy: {
            version: 'desc',
          },
        });

        if (previous) {
          await transaction.resume.update({
            where: { id: previous.id },
            data: {
              active: true,
            },
          });
        }
      }

      return target;
    });
  }
}
