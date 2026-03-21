"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.parseAmount = parseAmount;
exports.validateEmail = validateEmail;
exports.validatePhone = validatePhone;
exports.maskSensitiveData = maskSensitiveData;
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}
function parseAmount(value) {
    if (typeof value === 'number')
        return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
}
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validatePhone(phone) {
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}
function maskSensitiveData(data, visibleChars = 4) {
    if (data.length <= visibleChars)
        return data;
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
}
//# sourceMappingURL=validation.util.js.map