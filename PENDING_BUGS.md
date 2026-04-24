# Reporte de Bugs Pendientes y Deuda Técnica

Este documento registra comportamientos inesperados o bugs detectados durante las auditorías de seguridad que están fuera del alcance del parche actual pero requieren atención futura.

---

## [BUG-001] Colisión de ID en Registro de Suscripciones
- **Estado**: ✅ RESUELTO (2026-04-23)
- **Commit**: `7669727`
- **Descripción**: El literal estático `'new-sub'` fue eliminado. Se unificó el flujo de suscripciones a través de `/api/checkout/subscription`, la cual garantiza la creación de un registro con ID único antes de procesar el pago. El webhook ahora lanza un error explícito si la metadata es nula, garantizando integridad de datos.

---
