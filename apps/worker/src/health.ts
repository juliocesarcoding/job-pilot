import Redis from 'ioredis';

export interface WorkerHealth {
  status: 'ok';
  queueName: string;
  redis: 'ok';
}

export function getWorkerHealth(queueName: string): WorkerHealth {
  return {
    status: 'ok',
    queueName,
    redis: 'ok',
  };
}

export async function validateWorkerRedisConnection(redisUrl: string): Promise<void> {
  const redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 0,
  });

  try {
    await redis.connect();
    await redis.ping();
  } finally {
    redis.disconnect();
  }
}
