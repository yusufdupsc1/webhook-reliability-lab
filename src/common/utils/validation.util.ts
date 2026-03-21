export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function parseAmount(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return data;
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
}
