"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IdempotencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyService = void 0;
const common_1 = require("@nestjs/common");
let IdempotencyService = IdempotencyService_1 = class IdempotencyService {
    constructor(redis) {
        this.redis = redis;
        this.logger = new common_1.Logger(IdempotencyService_1.name);
        this.KEY_PREFIX = 'idempotency:';
        this.EXPIRATION_SECONDS = 86400;
        this.memoryCache = new Map();
        this.redisAvailable = true;
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
    async checkAndStore(key) {
        if (this.redis && this.redisAvailable) {
            try {
                const fullKey = `${this.KEY_PREFIX}${key}`;
                const existing = await this.redis.get(fullKey);
                if (existing) {
                    return existing;
                }
            }
            catch {
                this.redisAvailable = false;
            }
        }
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
            return cached.value;
        }
        return null;
    }
    async store(key, transactionId) {
        if (this.redis && this.redisAvailable) {
            try {
                const fullKey = `${this.KEY_PREFIX}${key}`;
                await this.redis.setex(fullKey, this.EXPIRATION_SECONDS, transactionId);
                return;
            }
            catch {
                this.redisAvailable = false;
            }
        }
        this.memoryCache.set(key, {
            value: transactionId,
            expiry: Date.now() + (this.EXPIRATION_SECONDS * 1000),
        });
    }
    async delete(key) {
        if (this.redis && this.redisAvailable) {
            try {
                const fullKey = `${this.KEY_PREFIX}${key}`;
                await this.redis.del(fullKey);
            }
            catch {
                this.redisAvailable = false;
            }
        }
        this.memoryCache.delete(key);
    }
    async exists(key) {
        if (this.redis && this.redisAvailable) {
            try {
                const fullKey = `${this.KEY_PREFIX}${key}`;
                const result = await this.redis.exists(fullKey);
                return result === 1;
            }
            catch {
                this.redisAvailable = false;
            }
        }
        const cached = this.memoryCache.get(key);
        return cached !== undefined && cached.expiry > Date.now();
    }
};
exports.IdempotencyService = IdempotencyService;
exports.IdempotencyService = IdempotencyService = IdempotencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [Object])
], IdempotencyService);
//# sourceMappingURL=idempotency.service.js.map