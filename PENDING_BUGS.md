# Reporte de Bugs Pendientes y Deuda Técnica

Este documento registra comportamientos inesperados o bugs detectados durante las auditorías de seguridad que están fuera del alcance del parche actual pero requieren atención futura.

---

## [BUG-001] Colisión de ID en Registro de Suscripciones
- **Severidad**: Media
- **Archivo**: `src/app/api/webhooks/stripe/route.ts`
- **Línea**: ~226
- **Descripción**:
  En el flujo de `INSTRUCTOR_SUBSCRIPTION`, el código utiliza un literal estático `'new-sub'` como fallback si `metadata.instructorSubscriptionId` es nulo.
  ```typescript
  where: { id: metadata.instructorSubscriptionId || 'new-sub' }
  ```
  Esto provoca que si dos instructores nuevos se suscriben simultáneamente o si un instructor tiene un problema con su metadata, las peticiones colisionen en el mismo ID de la base de datos, sobrescribiendo registros ajenos.

- **Recomendación**:
  Eliminar el fallback `'new-sub'`. Si no hay ID en la metadata, el `upsert` debe fallar o generar un UUID dinámico para evitar colisiones.

---
