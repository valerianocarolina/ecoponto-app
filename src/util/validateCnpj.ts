export function isValidCNPJ(cnpj: string): boolean {
  const cleanCnpj = cnpj.replace(/\D/g, "");

  if (cleanCnpj.length !== 14 || /^(\d)\1{13}$/.test(cleanCnpj)) {
    return false;
  }

  let sum = 0;
  let remainder: number;
  const multiplier1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const multiplier2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCnpj[i]) * multiplier1[i];
  }

  remainder = sum % 11;
  if (remainder < 2 && parseInt(cleanCnpj[12]) !== 0) return false;
  if (remainder >= 2 && parseInt(cleanCnpj[12]) !== 11 - remainder)
    return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCnpj[i]) * multiplier2[i];
  }

  remainder = sum % 11;
  if (remainder < 2 && parseInt(cleanCnpj[13]) !== 0) return false;
  if (remainder >= 2 && parseInt(cleanCnpj[13]) !== 11 - remainder)
    return false;

  return true;
}
