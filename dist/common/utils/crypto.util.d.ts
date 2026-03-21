export declare class CryptoUtil {
    static generateIdempotencyKey(): string;
    static verifyHmac(payload: string, signature: string, secret: string): boolean;
    static hashData(data: string): string;
    static generateSignature(payload: Record<string, unknown>, secret: string): string;
}
