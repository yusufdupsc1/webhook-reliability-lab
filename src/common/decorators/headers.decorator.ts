import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IdempotencyKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['idempotency-key'] || request.body.idempotencyKey;
  },
);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const RawHeaders = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.rawHeaders;
  },
);
