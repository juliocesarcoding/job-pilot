import { checkPostgresConnection } from '@job-pilot/database';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { loadApiEnv } from '../config/env';

export interface DependencyHealth {
  status: 'ok' | 'error';
  message?: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  postgres: DependencyHealth;
  redis: DependencyHealth;
}

@Injectable()
export class HealthService {
  async getHealth(): Promise<HealthResponse> {
    const env = loadApiEnv(process.env);
    const [postgres, redis] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(env.REDIS_URL),
    ]);
    const status = postgres.status === 'ok' && redis.status === 'ok' ? 'ok' : 'error';

    return {
      status,
      postgres,
      redis,
    };
  }

  private async checkPostgres(): Promise<DependencyHealth> {
    try {
      await checkPostgresConnection();
      return { status: 'ok' };
    } catch (error: unknown) {
      return { status: 'error', message: this.getErrorMessage(error) };
    }
  }

  private async checkRedis(redisUrl: string): Promise<DependencyHealth> {
    const redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
    });

    try {
      await redis.connect();
      await redis.ping();
      return { status: 'ok' };
    } catch (error: unknown) {
      return { status: 'error', message: this.getErrorMessage(error) };
    } finally {
      redis.disconnect();
    }
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown dependency error';
  }
}
