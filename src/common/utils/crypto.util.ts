import * as crypto from 'crypto';

export class CryptoUtil {
  static generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  static verifyHmac(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static generateSignature(payload: Record<string, unknown>, secret: string): string {
    const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto
      .createHmac('sha256', secret)
      .update(sortedPayload)
      .digest('hex');
  }
}
