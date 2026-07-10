import { loadWorkerEnv } from './config/env';
import { getWorkerHealth, validateWorkerRedisConnection } from './health';

async function bootstrap(): Promise<void> {
  const env = loadWorkerEnv(process.env);
  await validateWorkerRedisConnection(env.REDIS_URL);

  console.info('Worker booted', getWorkerHealth(env.QUEUE_NAME));
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
