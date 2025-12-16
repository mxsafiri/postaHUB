export function normalizePhoneToE164(input: string): string {
  const raw = (input ?? '').trim();
  if (!raw) {
    throw new Error('phone is required');
  }

  if (raw.startsWith('+')) {
    return raw;
  }

  const digitsOnly = raw.replace(/\D/g, '');
  if (digitsOnly.startsWith('255') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
    return `+255${digitsOnly.slice(1)}`;
  }

  throw new Error('phone must be E.164 (+255...) or local (07XXXXXXXX)');
}
