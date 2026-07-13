import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@job-pilot/database';
import { LocalResumeStorageProvider } from './storage/local-resume-storage.provider';
import { PrismaResumeRepository } from './repositories/resume.repository';
import { ResumeService } from './resume.service';
import { ResumeError } from './domain/errors';

const testEmail = 'resume-service@resume.test';
let storageRoot: string;
let originalDevEmail: string | undefined;
let service: ResumeService;

describe('ResumeService integration', () => {
  beforeEach(async () => {
    originalDevEmail = process.env.JOBPILOT_DEV_USER_EMAIL;
    process.env.JOBPILOT_DEV_USER_EMAIL = testEmail;
    storageRoot = await mkdtemp(join(tmpdir(), 'job-pilot-resume-service-'));
    await deleteTestData();
    await createUserWithProfile(testEmail);
    service = new ResumeService(
      new PrismaResumeRepository(prisma),
      new LocalResumeStorageProvider(storageRoot),
    );
  });

  afterEach(async () => {
    if (originalDevEmail === undefined) {
      delete process.env.JOBPILOT_DEV_USER_EMAIL;
    } else {
      process.env.JOBPILOT_DEV_USER_EMAIL = originalDevEmail;
    }

    await deleteTestData();
    await rm(storageRoot, { recursive: true, force: true });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('uploads, lists, downloads, versions, switches active resume, and soft deletes', async () => {
    const first = await service.uploadResume(createPdfFile('resume-v1.pdf'));
    const second = await service.uploadResume(createDocxFile('resume-v2.docx'));
    const listed = await service.listResumes();
    const active = await service.getActiveResume();
    const download = await service.downloadResume(first.id);

    expect(first.version).toBe(1);
    expect(second.version).toBe(2);
    expect(second.active).toBe(true);
    expect(listed.map((resume) => resume.version)).toEqual([2, 1]);
    expect(active.id).toBe(second.id);
    expect(download.resume.id).toBe(first.id);
    download.stream.destroy();

    await service.deleteResume(second.id);

    const activeAfterDelete = await service.getActiveResume();
    const listedAfterDelete = await service.listResumes();

    expect(activeAfterDelete.id).toBe(first.id);
    expect(listedAfterDelete).toHaveLength(1);
    await expect(service.deleteResume(first.id)).rejects.toMatchObject({
      code: 'RESUME_DELETE_NOT_ALLOWED',
    });
  });

  it('rejects invalid uploads', async () => {
    await expect(
      service.uploadResume({
        originalFileName: 'resume.txt',
        mimeType: 'text/plain',
        size: 5,
        buffer: Buffer.from('hello'),
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_RESUME_UPLOAD',
    });
  });

  it('enforces candidate ownership for downloads', async () => {
    const other = await createUserWithProfile('other-resume@resume.test');
    const otherResume = await prisma.resume.create({
      data: {
        candidateProfileId: other.profileId,
        originalFileName: 'other.pdf',
        storedFileName: 'other.pdf',
        mimeType: 'application/pdf',
        extension: '.pdf',
        fileSize: 4,
        storageProvider: 'LOCAL',
        storagePath: `${other.profileId}/other.pdf`,
        checksum: 'checksum',
        version: 1,
        uploadedAt: new Date(),
      },
    });

    await expect(service.downloadResume(otherResume.id)).rejects.toMatchObject({
      code: 'RESUME_NOT_FOUND',
    });
  });

  it('reports missing active resume', async () => {
    await expect(service.getActiveResume()).rejects.toBeInstanceOf(ResumeError);
  });
});

async function createUserWithProfile(email: string): Promise<{ profileId: string }> {
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Resume Test',
    },
  });
  const profile = await prisma.candidateProfile.create({
    data: {
      userId: user.id,
    },
  });

  return { profileId: profile.id };
}

async function deleteTestData(): Promise<void> {
  await prisma.resume.deleteMany({
    where: {
      candidateProfile: {
        user: {
          email: {
            endsWith: '@resume.test',
          },
        },
      },
    },
  });
  await prisma.candidateProfile.deleteMany({
    where: {
      user: {
        email: {
          endsWith: '@resume.test',
        },
      },
    },
  });
  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: '@resume.test',
      },
    },
  });
}

function createPdfFile(originalFileName: string): {
  originalFileName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
} {
  const buffer = Buffer.from('%PDF-1.4');

  return {
    originalFileName,
    mimeType: 'application/pdf',
    size: buffer.length,
    buffer,
  };
}

function createDocxFile(originalFileName: string): {
  originalFileName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
} {
  const buffer = Buffer.from('PK docx');

  return {
    originalFileName,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: buffer.length,
    buffer,
  };
}
