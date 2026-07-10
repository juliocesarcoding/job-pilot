import { loadRootEnvFile } from '@job-pilot/shared';
import { z } from 'zod';

function requiredString(name: string): z.ZodString {
  return z.string({ required_error: `${name} is required` }).min(1, `${name} is required`);
}

function redisUrl(name: string): z.ZodEffects<z.ZodString, string, string> {
  return requiredString(name).superRefine((value, context) => {
    if (value.length === 0) {
      return;
    }

    try {
      new URL(value);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${name} must be a valid URL`,
      });
      return;
    }

    if (!value.startsWith('redis://') && !value.startsWith('rediss://')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${name} must start with redis:// or rediss://`,
      });
    }
  });
}

const workerEnvSchema = z.object({
  REDIS_URL: redisUrl('REDIS_URL'),
  QUEUE_NAME: z.string().default('job-pilot-default'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;

export function loadWorkerEnv(overrides: Record<string, string | undefined> = {}): WorkerEnv {
  loadRootEnvFile();

  const result = workerEnvSchema.safeParse({ ...process.env, ...overrides });

  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(`Invalid worker environment: ${messages}`);
  }

  return result.data;
}
