/**
 * Convierte strings vacíos a null y elimina campos undefined
 * antes de enviar payloads a endpoints con validación Zod strict.
 */
export function sanitizePayload(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) => [
        key,
        typeof value === 'string' && value.trim() === '' ? null : value
      ])
      .filter(([_, value]) => value !== undefined)
  );
}
