/**
 * Normalizes a Bangladeshi or international phone number for strict exact matching.
 * - Strips all non-digit characters.
 * - Normalizes +880 / 880 / 0 prefix so standard BD numbers become 01XXXXXXXXX.
 * - Enforces minimum 10 digits.
 * - Returns null if the phone is invalid or shorter than 10 digits.
 */
export function normalizePhoneNumber(rawPhone: unknown): string | null {
  if (typeof rawPhone !== "string" || !rawPhone.trim()) return null;

  let digits = rawPhone.replace(/\D/g, "");

  // Normalize +880 or 880 country code to leading 0
  if (digits.startsWith("880") && digits.length >= 12) {
    digits = "0" + digits.slice(3);
  } else if (!digits.startsWith("0") && digits.length === 10) {
    // If entered without leading 0 (e.g. 17XXXXXXXX), normalize to 01XXXXXXXXX
    digits = "0" + digits;
  }

  if (digits.length < 10) {
    return null;
  }

  return digits;
}
