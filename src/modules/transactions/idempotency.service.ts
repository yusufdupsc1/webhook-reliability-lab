import { Injectable, Logger, Optional } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly KEY_PREFIX = 'idempotency:';
  private readonly EXPIRATION_SECONDS = 86400;
  private readonly memoryCache = new Map<string, { value: string; expiry: number }>();
  private redisAvailable = true;

  constructor(@Optional() private readonly redis: Redis | null) {
    if (!this.redis) {
      this.logger.warn('Redis not configured - using in-memory cache (not recommended for production)');
      this.redisAvailable = false;
      return;
    }

    this.redis.on('error', () => {
      this.logger.warn('Redis connection error - falling back to in-memory cache');
      this.redisAvailable = false;
    });
  }

  async checkAndStore(key: string): Promise<string | null> {
    if (this.redis && this.redisAvailable) {
      try {
        const fullKey = `${this.KEY_PREFIX}${key}`;
        const existing = await this.redis.get(fullKey);
        if (existing) {
          return existing;
        }
      } catch {
        this.redisAvailable = false;
      }
    }

    const cached = this.memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }
    return null;
  }

  async store(key: string, transactionId: string): Promise<void> {
    if (this.redis && this.redisAvailable) {
      try {
        const fullKey = `${this.KEY_PREFIX}${key}`;
        await this.redis.setex(fullKey, this.EXPIRATION_SECONDS, transactionId);
        return;
      } catch {
        this.redisAvailable = false;
      }
    }

    this.memoryCache.set(key, {
      value: transactionId,
      expiry: Date.now() + (this.EXPIRATION_SECONDS * 1000),
    });
  }

  async delete(key: string): Promise<void> {
    if (this.redis && this.redisAvailable) {
      try {
        const fullKey = `${this.KEY_PREFIX}${key}`;
        await this.redis.del(fullKey);
      } catch {
        this.redisAvailable = false;
      }
    }
    this.memoryCache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    if (this.redis && this.redisAvailable) {
      try {
        const fullKey = `${this.KEY_PREFIX}${key}`;
        const result = await this.redis.exists(fullKey);
        return result === 1;
      } catch {
        this.redisAvailable = false;
      }
    }
    const cached = this.memoryCache.get(key);
    return cached !== undefined && cached.expiry > Date.now();
  }
}
