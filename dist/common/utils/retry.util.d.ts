export declare class RetryUtil {
    static calculateBackoff(attempt: number, baseDelayMs?: number): number;
    static retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelayMs?: number): Promise<T>;
    static sleep(ms: number): Promise<void>;
}
