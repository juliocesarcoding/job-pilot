import { loadRootEnvFile } from '@job-pilot/shared';
import { z } from 'zod';

function requiredString(name: string): z.ZodString {
  return z.string({ required_error: `${name} is required` }).min(1, `${name} is required`);
}

function urlWithProtocol(name: string, protocols: string[]): z.ZodEffects<z.ZodString, string, string> {
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

    if (!protocols.some((protocol) => value.startsWith(protocol))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${name} must start with ${protocols.join(' or ')}`,
      });
    }
  });
}

const apiEnvSchema = z.object({
  PORT: z.coerce
    .number({ invalid_type_error: 'PORT must be a number' })
    .int('PORT must be an integer')
    .min(1, 'PORT must be between 1 and 65535')
    .max(65535, 'PORT must be between 1 and 65535')
    .default(3001),
  DATABASE_URL: urlWithProtocol('DATABASE_URL', ['postgresql://', 'postgres://']),
  REDIS_URL: urlWithProtocol('REDIS_URL', ['redis://', 'rediss://']),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function loadApiEnv(overrides: Record<string, string | undefined> = {}): ApiEnv {
  loadRootEnvFile();

  const result = apiEnvSchema.safeParse({ ...process.env, ...overrides });

  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(`Invalid API environment: ${messages}`);
  }

  return result.data;
}
