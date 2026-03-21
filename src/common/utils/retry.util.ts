export class RetryUtil {
  static calculateBackoff(attempt: number, baseDelayMs: number = 1000): number {
    const delay = baseDelayMs * Math.pow(2, attempt - 1);
    const maxDelay = 16000;
    return Math.min(delay, maxDelay);
  }

  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 5,
    baseDelayMs: number = 1000,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const delay = this.calculateBackoff(attempt, baseDelayMs);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
