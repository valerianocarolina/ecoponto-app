export function validatePhone(value: string): boolean {
  return /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(value);
}
