import Redis from 'ioredis';
export declare class IdempotencyService {
    private readonly redis;
    private readonly logger;
    private readonly KEY_PREFIX;
    private readonly EXPIRATION_SECONDS;
    private readonly memoryCache;
    private redisAvailable;
    constructor(redis: Redis | null);
    checkAndStore(key: string): Promise<string | null>;
    store(key: string, transactionId: string): Promise<void>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
