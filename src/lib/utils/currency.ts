/**
 * Formatea un monto en pesos mexicanos (MXN).
 * Usa punto como separador decimal y coma para miles.
 * Ejemplo: 1234.5 → "$1,234.50"
 */
export function formatMXN(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MXN',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num).replace('MX$', '$');
}

/**
 * Formatea sin símbolo de moneda.
 * Ejemplo: 1234.5 → "1,234.50"
 */
export function formatAmount(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
