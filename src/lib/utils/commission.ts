/**
 * UTILIDAD CENTRALIZADA DE COMISIONES - PLATTFORM
 * Mapeo oficial de Tiers a Porcentajes de Comisión
 */

export const COMMISSION_RATES = {
  STARTER: 15, // 15% Starter
  GROWTH: 10,  // 10% Growth
  SCALE: 7     // 7% Scale
};

/**
 * Retorna el porcentaje de comisión basado en el nombre del plan (tier).
 * Si el plan no es reconocido, retorna 15% por seguridad.
 */
export function getCommissionPercentage(tier: string | null | undefined): number {
  if (!tier) return COMMISSION_RATES.STARTER;

  const normalizedTier = tier.toUpperCase().trim();

  if (normalizedTier.includes('SCALE')) return COMMISSION_RATES.SCALE;   // 7% Scale
  if (normalizedTier.includes('GROWTH')) return COMMISSION_RATES.GROWTH; // 10% Growth
  if (normalizedTier.includes('STARTER')) return COMMISSION_RATES.STARTER; // 15% Starter

  // Fallback de seguridad
  return COMMISSION_RATES.STARTER;
}
