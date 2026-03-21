import { TransactionStatus, GatewayType } from '../../../common/types';
export declare class Transaction {
    id: string;
    externalId: string;
    gateway: GatewayType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    customerEmail: string;
    customerPhone: string;
    customerName: string;
    metadata: Record<string, unknown>;
    gatewayResponse: Record<string, unknown>;
    idempotencyKey: string;
    paymentUrl: string;
    returnUrl: string;
    refundedAmount: number;
    createdAt: Date;
    updatedAt: Date;
}
