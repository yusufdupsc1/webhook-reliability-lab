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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transactions_service_1 = require("./transactions.service");
const types_1 = require("../../common/types");
let TransactionsController = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async initiatePayment(dto, idempotencyKey) {
        if (!idempotencyKey) {
            throw new common_1.BadRequestException('idempotency-key header is required');
        }
        dto.idempotencyKey = idempotencyKey;
        const transaction = await this.transactionsService.createPayment(dto);
        return {
            success: transaction.status !== types_1.TransactionStatus.FAILED,
            transaction,
            paymentUrl: transaction.paymentUrl,
        };
    }
    async listTransactions(page, limit, gateway, status, customerEmail) {
        const filters = { gateway, status, customerEmail };
        return this.transactionsService.findAll(filters, page || 1, limit || 20);
    }
    async getTransaction(id) {
        const transaction = await this.transactionsService.findOne(id);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction ${id} not found`);
        }
        return transaction;
    }
    async getStats() {
        return this.transactionsService.getTransactionStats();
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate a new payment' }),
    (0, swagger_1.ApiHeader)({ name: 'idempotency-key', required: true, description: 'Unique idempotency key' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment initiated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all transactions' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'gateway', required: false, enum: types_1.GatewayType }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: types_1.TransactionStatus }),
    (0, swagger_1.ApiQuery)({ name: 'customerEmail', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('gateway')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('customerEmail')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "listTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getStats", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('transactions'),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map