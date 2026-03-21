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
exports.RefundsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const refunds_service_1 = require("./refunds.service");
let RefundsController = class RefundsController {
    constructor(refundsService) {
        this.refundsService = refundsService;
    }
    async createRefund(dto) {
        const refund = await this.refundsService.createRefund(dto);
        return { success: refund.status !== 'failed', refund };
    }
    async listRefunds(page, limit) {
        return this.refundsService.findAll(page || 1, limit || 20);
    }
    async getRefundStats() {
        return this.refundsService.getRefundStats();
    }
    async getRefund(id) {
        const refund = await this.refundsService.findOne(id);
        if (!refund) {
            throw new Error(`Refund ${id} not found`);
        }
        return refund;
    }
};
exports.RefundsController = RefundsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a refund' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Refund created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RefundsController.prototype, "createRefund", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all refunds' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of refunds' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], RefundsController.prototype, "listRefunds", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get refund statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RefundsController.prototype, "getRefundStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get refund by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Refund ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RefundsController.prototype, "getRefund", null);
exports.RefundsController = RefundsController = __decorate([
    (0, swagger_1.ApiTags)('refunds'),
    (0, common_1.Controller)('refunds'),
    __metadata("design:paramtypes", [refunds_service_1.RefundsService])
], RefundsController);
//# sourceMappingURL=refunds.controller.js.map