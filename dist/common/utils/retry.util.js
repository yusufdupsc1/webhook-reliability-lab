"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryUtil = void 0;
class RetryUtil {
    static calculateBackoff(attempt, baseDelayMs = 1000) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        const maxDelay = 16000;
        return Math.min(delay, maxDelay);
    }
    static async retryWithBackoff(fn, maxRetries = 5, baseDelayMs = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    const delay = this.calculateBackoff(attempt, baseDelayMs);
                    await this.sleep(delay);
                }
            }
        }
        throw lastError;
    }
    static sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.RetryUtil = RetryUtil;
//# sourceMappingURL=retry.util.js.map