/**
 * Türkçe telefon numarası formatla: 05XX XXX XX XX
 * Input'un onChange'inde kullanılır.
 */
export function formatTurkishPhone(value: string): string {
  // Sadece rakamları al, maks 11 hane
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
}

/** Formatlı değerden sadece rakamları al (API'ye göndermeden önce) */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Türkçe telefon regex: 05xx xxx xx xx (11 rakam, boşluklu veya boşluksuz) */
export const TURKISH_PHONE_REGEX = /^0[5-9]\d{2}[\s]?\d{3}[\s]?\d{2}[\s]?\d{2}$/;
