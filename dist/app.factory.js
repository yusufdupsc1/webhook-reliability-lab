"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
const common_1 = require("@nestjs/common");
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000'];
function resolveAllowedOrigins() {
    return (process.env.APP_ORIGIN || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}
function configureApp(app) {
    const allowedOrigins = resolveAllowedOrigins();
    app.enableCors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : DEFAULT_ALLOWED_ORIGINS,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    return app;
}
//# sourceMappingURL=app.factory.js.map