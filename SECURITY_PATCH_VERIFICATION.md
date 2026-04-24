# Verificación del Parche de Seguridad Crítico (v1.1)

Este documento detalla los pasos manuales para validar la implementación de los tres componentes del parche de seguridad aplicado el 23 de Abril de 2026.

## 1. Validación de Registro de Usuarios (API)
Este parche evita que usuarios no autorizados escalen privilegios a `ADMIN` y asegura que los payloads sean estrictos.

### Pruebas de Escalada de Privilegios
Ejecuta los siguientes comandos desde una terminal con `curl`:

- **Intento de Registro ADMIN (Debe fallar con 403):**
  ```bash
  curl -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test_admin@example.com", "password":"password123", "name":"Hacker", "role":"ADMIN"}'
  ```

- **Intento de Registro con campos extra (Debe fallar con 400 - Zod Strict):**
  ```bash
  curl -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test_extra@example.com", "password":"password123", "name":"User", "role":"STUDENT", "isAdmin":true}'
  ```

- **Registro de Estudiante Exitoso (Debe funcionar con 200):**
  ```bash
  curl -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"student_test@example.com", "password":"password123", "name":"Student", "role":"STUDENT"}'
  ```

## 2. Validación de Headers de Seguridad
Asegura que el navegador aplique políticas de seguridad modernas (CSP, HSTS, etc.).

### Verificación de Headers
Ejecuta el siguiente comando para inspeccionar la respuesta del servidor:
```bash
curl.exe -I http://localhost:3001/
```

**Verifica que aparezcan estas líneas:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy-Report-Only: ...` (Verifica que contenga Stripe, Supabase y OpenAI)

## 3. Validación de Blindaje JWT
Previene el uso de claves por defecto y asegura que el servidor no inicie sin un secreto configurado.

### Test de "Fallo Seguro"
1. Abre el archivo `.env` o `.env.local`.
2. Comenta la línea `NEXTAUTH_SECRET`.
3. Intenta iniciar el servidor con `npm run dev`.
4. **Resultado esperado:** La aplicación debe fallar inmediatamente con el mensaje: `FATAL: NEXTAUTH_SECRET no configurado`.

---
**Auditado y Aplicado por:** Antigravity AI
**Fecha:** 2026-04-23

## Hallazgo 7 — Rate Limiting en IA (Prisma Guard)
Este parche implementa un freno de emergencia contra el abuso de cuotas de OpenAI, limitando a 5 generaciones por hora y 30 por mes por instructor.

### (a) Generación normal bajo cuota (Debe devolver 200 OK)
```bash
curl -X POST http://localhost:3001/api/ai/generate-course \
  -H "Cookie: accessToken=<TOKEN_VALIDO>" \
  -F "promptText=Curso de prueba de IA"
```

### (b) Instructor que excedió las 5/hora (Debe devolver 429 con reason: 'hourly_limit')
```bash
# Repetir la petición (a) 6 veces consecutivas.
# Resultado esperado en la 6ta:
# { "error": "Has alcanzado el límite horario...", "reason": "hourly_limit", "resetAt": "..." }
```

### (c) Instructor que excedió las 30/mes (Debe devolver 429 con reason: 'monthly_limit')
```bash
# Simular 30 jobs completados en el mes actual vía SQL y luego intentar generar.
# { "error": "Has alcanzado el límite mensual...", "reason": "monthly_limit", "resetAt": "..." }
```

### (d) Verificación de protección contra "Stale Jobs"
Este test confirma que un proceso que quedó pegado en `PROCESSING` por un crash del servidor hace más de 10 min ya NO bloquea la cuota del usuario.

1. Simular un job pegado antiguo:
```sql
-- Ejecutar en consola de Supabase / Postgres
UPDATE "ai_generation_jobs" 
SET "status" = 'PROCESSING', 
    "created_at" = NOW() - INTERVAL '15 minutes' 
WHERE id = (SELECT id FROM "ai_generation_jobs" LIMIT 1);
```

2. Ejecutar curl de generación (debe pasar si el usuario tiene cuota libre, ignorando el job de arriba):
```bash
curl -X POST http://localhost:3001/api/ai/generate-course \
  -H "Cookie: accessToken=<TOKEN_VALIDO>" \
  -F "promptText=Curso de prueba"
```

---

## Hallazgo 11 — Blindaje Estructural del Middleware
Este parche implementa una capa de protección global sobre `/api/*`, bloqueando cualquier acceso no autenticado a endpoints que no estén explícitamente en la lista blanca.

### (a) Request a endpoint protegido sin cookie (Debe devolver 401 "Sesión requerida")
```bash
curl -X GET http://localhost:3001/api/student/profile
```

### (b) Request con cookie falsa (Debe devolver 401 "Sesión requerida")
```bash
curl -X GET http://localhost:3001/api/student/profile \
  -H "Cookie: accessToken=token_falso_invalido"
```

### (c) Request con cookie válida (Debe devolver 200 OK)
```bash
# 1. Obtener un token válido haciendo login real o revisando el navegador
# 2. Reemplazar <TOKEN_VALIDO> abajo:
curl -X GET http://localhost:3001/api/student/profile \
  -H "Cookie: accessToken=<TOKEN_VALIDO>"
```

## Hallazgo 4 — Autorización en Registro de Progreso
Este parche asegura que solo estudiantes con inscripciones válidas (`ACTIVE` o `COMPLETED`) puedan registrar progreso, y valida la integridad de la relación lección-curso.

> [!IMPORTANT]
> Requiere dev server corriendo. Reemplazar `<TOKEN>`, `<COURSE_ID>`, `<LESSON_ID>` con valores reales de la DB antes de ejecutar.

### (a) Estudiante con enrollment válido (Debe devolver 200 OK)
```bash
curl -X POST http://localhost:3001/api/student/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<TOKEN>" \
  -d '{"courseId":"<COURSE_ID>", "lessonId":"<LESSON_ID>", "completed":true}'
```

### (b) Estudiante SIN enrollment (Debe devolver 403 "Acceso denegado")
```bash
curl -X POST http://localhost:3001/api/student/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<TOKEN>" \
  -d '{"courseId":"<COURSE_ID_SIN_INSCRIPCION>", "lessonId":"<LESSON_ID_VALIDO>", "completed":true}'
```

### (c) Inyección cruzada de lección (Debe devolver 403 "Integridad fallida")
```bash
curl -X POST http://localhost:3001/api/student/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<TOKEN>" \
  -d '{"courseId":"<COURSE_A>", "lessonId":"<LESSON_DEL_CURSO_B>", "completed":true}'
```

### (d) Payload inválido con campo extra (Debe devolver 400 "Payload inválido")
```bash
curl -X POST http://localhost:3001/api/student/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<TOKEN>" \
  -d '{"courseId":"<COURSE_ID>", "lessonId":"<LESSON_ID>", "completed":true, "isAdmin":true}'
```

---

## Hallazgo 9 — Idempotencia Webhooks de Stripe
Este parche asegura que cada evento de Stripe se procese exactamente una vez, evitando doble facturación o inscripciones duplicadas.

### Paso 1: Verificación de Duplicados (CRÍTICO)
Antes de aplicar la migración, Diego debe correr estas queries en la consola de Supabase:
```sql
-- Buscar transacciones duplicadas
SELECT stripe_session_id, COUNT(*) as registros
FROM transactions 
WHERE stripe_session_id IS NOT NULL
GROUP BY stripe_session_id
HAVING COUNT(*) > 1;

-- Buscar cupones duplicados por usuario
SELECT user_id, coupon_id, COUNT(*) as registros
FROM coupon_usages
GROUP BY user_id, coupon_id
HAVING COUNT(*) > 1;
```

**IMPORTANTE**: Si alguna query devuelve resultados, **NO aplicar la migración**. Se requiere limpieza manual de los duplicados antes de proceder.

### Paso 2: Aplicación de la Migración
Una vez limpia la DB, aplicar la migración manual que incluye el guard proactivo:
```bash
npx prisma migrate deploy
```
*Si la migración falla con "RAISE EXCEPTION", significa que aún quedan duplicados en la DB.*

### Paso 3: Verificación del Fix
Para validar la idempotencia, usar la Stripe CLI:
```bash
# 1. Enviar evento de prueba
stripe trigger checkout.session.completed

# 2. Re-enviar el MISMO evento (usando el ID del evento anterior si es posible o re-trigger)
# El log del servidor debe mostrar: ℹ️ Evento [ID] ya procesado previamente.
# La respuesta HTTP debe ser 200 OK con { "received": true, "duplicate": true }.
```

---

## Hallazgo 10 — Dependencias Vulnerables (Hardening)
Este parche endurece la postura de seguridad del proyecto eliminando librerías con vulnerabilidades críticas y aplicando parches forzosos a dependencias transitivas.

### Verificación de Auditoría
Ejecuta el siguiente comando para verificar que las vulnerabilidades críticas han sido mitigadas:
```bash
npm audit --omit=dev
```

**Resultado esperado:**
*   `0` vulnerabilidades en librerías de terceros (excepto Next.js).
*   **Next.js (Pendiente)**: El reporte mostrará vulnerabilidades en `next` (v14.2.35). Esto es esperado ya que el fix requiere migrar a v15.5.15+, lo cual es un breaking change agendado para una sesión dedicada.

### Componentes Aplicados:
1.  **Eliminación de `xlsx`**: Se removió la librería SheetJS (vulnerable a Prototype Pollution) y se reemplazó por exportación CSV nativa con soporte BOM para compatibilidad directa con Excel.
2.  **Actualización de `resend`**: De `6.9.4` a `6.12.2`.
3.  **Overrides de Seguridad (Fuerza Bruta)**:
    *   `@xmldom/xmldom`: Forzado a `0.9.10` (Parcha vulnerabilidades de parsing XML).
    *   `uuid`: Forzado a `14.0.0` (Parcha vulnerabilidad en cadena de `svix`).
    *   `dompurify`: Forzado a `3.4.1` (Parcha vulnerabilidad en cadena de `jspdf`).

### Validación de Funcionalidad:
Para asegurar que los parches no rompieron la lógica de negocio, verificar:
1.  **Exportación**: Ir a cualquier tabla de Admin (Usuarios, Transacciones, etc.) y descargar el reporte CSV. Verificar que abre correctamente en Excel con acentos y ñ.
2.  **Certificados**: Descargar un certificado de curso. Verificar que el PDF se genera y descarga correctamente.
3.  **Emails**: Realizar una acción que envíe correo (ej. reset password). Verificar que el correo llega correctamente (validación de `resend`).
