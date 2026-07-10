import { PrismaClient } from '@prisma/client';
import { loadDatabaseEnv } from './env';

loadDatabaseEnv();

export const prisma = new PrismaClient();

export async function checkPostgresConnection(client: PrismaClient = prisma): Promise<void> {
  await client.$queryRaw`SELECT 1`;
}
