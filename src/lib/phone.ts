/**
 * Phone number validation and normalization utility.
 * Supports:
 * - 10-digit Indian numbers: 1234567890 -> +911234567890
 * - 12-digit numbers with 91 prefix: 911234567890 -> +911234567890
 * - Numbers with +: +911234567890 -> +911234567890
 * - Numbers with spaces, dashes, or leading 0:
 *   e.g. "+91 12345 67890" -> +911234567890
 *   e.g. "01234567890" -> +911234567890
 */

export interface PhoneValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

export function normalizePhoneNumber(rawPhone: string | null | undefined): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, normalized: '', error: 'Phone number is required' };
  }

  // Remove spaces, hyphens, parentheses, dots
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, '');

  if (!cleaned) {
    return { valid: false, normalized: '', error: 'Phone number is required' };
  }

  // Handle leading 00 (e.g., 00911234567890 -> +911234567890)
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If starts with +
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    if (!/^\d{7,15}$/.test(digits)) {
      return { valid: false, normalized: '', error: 'Invalid international phone number' };
    }
    return { valid: true, normalized: cleaned };
  }

  // Ensure remainder is digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, normalized: '', error: 'Phone number must contain only numbers' };
  }

  // 10 digits (Standard Indian mobile number, e.g. 1234567890 or 9876543210)
  if (cleaned.length === 10) {
    return { valid: true, normalized: `+91${cleaned}` };
  }

  // 11 digits starting with 0 (Indian trunk dialing prefix, e.g. 01234567890)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return { valid: true, normalized: `+91${cleaned.slice(1)}` };
  }

  // 12 digits starting with 91 (e.g. 911234567890)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return { valid: true, normalized: `+${cleaned}` };
  }

  // Other standard lengths (7 to 15 digits)
  if (cleaned.length >= 7 && cleaned.length <= 15) {
    return { valid: true, normalized: `+${cleaned}` };
  }

  return { valid: false, normalized: '', error: 'Phone number must be at least 10 digits' };
}

/**
 * Returns all common format variations for a given phone number.
 * Ensures backward compatibility and cross-format queries so that:
 * "1234567890", "911234567890", and "+911234567890"
 * can all match the same record in the database.
 */
export function getPhoneLookupVariations(rawPhone: string | null | undefined): string[] {
  if (!rawPhone || typeof rawPhone !== 'string') return [];

  const variations = new Set<string>();
  const trimmed = rawPhone.trim();
  if (trimmed) variations.add(trimmed);

  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned) variations.add(cleaned);

  const { valid, normalized } = normalizePhoneNumber(rawPhone);
  if (valid && normalized) {
    variations.add(normalized); // e.g. +911234567890

    if (normalized.startsWith('+')) {
      variations.add(normalized.slice(1)); // e.g. 911234567890
    }

    if (normalized.startsWith('+91') && normalized.length === 13) {
      const tenDigits = normalized.slice(3);
      variations.add(tenDigits); // e.g. 1234567890
      variations.add(`0${tenDigits}`); // e.g. 01234567890
    }
  }

  // Extract trailing 10 digits if available
  const onlyDigits = cleaned.replace(/\D/g, '');
  if (onlyDigits.length >= 10) {
    const last10 = onlyDigits.slice(-10);
    variations.add(last10);
    variations.add(`+91${last10}`);
    variations.add(`91${last10}`);
    variations.add(`0${last10}`);
  }

  return Array.from(variations).filter(Boolean);
}

/**
 * Format phone number for clean UI display.
 * E.g. +911234567890 -> +91 12345 67890
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.trim().replace(/[\s\-]/g, '');

  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  return phone;
}
