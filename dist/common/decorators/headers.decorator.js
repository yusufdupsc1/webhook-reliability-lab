"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawHeaders = exports.CurrentUser = exports.IdempotencyKey = void 0;
const common_1 = require("@nestjs/common");
exports.IdempotencyKey = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['idempotency-key'] || request.body.idempotencyKey;
});
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
exports.RawHeaders = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.rawHeaders;
});
//# sourceMappingURL=headers.decorator.js.map