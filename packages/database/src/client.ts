import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function checkPostgresConnection(client: PrismaClient = prisma): Promise<void> {
  await client.$queryRaw`SELECT 1`;
}
