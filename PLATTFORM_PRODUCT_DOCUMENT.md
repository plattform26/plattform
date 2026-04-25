# PLATTFORM: Documentación Técnica y de Producto v1.1

Este documento constituye la referencia maestra de **Plattform**, una solución SaaS (Software as a Service) integral para la creación, venta y gestión de academias digitales de alto rendimiento.

---

## 1. Resumen Ejecutivo

**Plattform** es una plataforma de e-learning premium diseñada para creadores de contenido, expertos e instituciones que buscan una infraestructura robusta, segura y escalable para monetizar su conocimiento.

*   **Público Objetivo**: Instructores independientes, academias digitales y administradores de contenido educativo.
*   **Propuesta de Valor**: Unificación de la creación de cursos (con apoyo de IA), gestión financiera (pagos vía Stripe), y experiencia de aprendizaje fluida para el estudiante, todo bajo un entorno blindado con estándares de seguridad de nivel bancario.
*   **Estado Actual**: v1.1 (Producción Estable). Migración a Next.js 15 completada, auditoría de seguridad crítica ejecutada y validación de tipos Zod implementada en el 100% de los endpoints transaccionales.

---

## 2. Stack Tecnológico

Basado en el análisis de `package.json`, Plattform utiliza un stack moderno y de alto rendimiento:

| Categoría | Tecnología | Versión |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 15.5.15 |
| **Lenguaje** | TypeScript | 5.x |
| **Base de Datos** | PostgreSQL (vía Supabase) | - |
| **ORM** | Prisma | 5.22.0 |
| **Autenticación** | JWT (Jose) + Cookies de Edge | - |
| **Pagos** | Stripe (Checkout, Connect, Subscriptions) | 21.0.1 |
| **Inteligencia Artificial** | OpenAI (GPT-4o) | 6.33.0 |
| **Email** | Resend / Nodemailer | 6.12.2 / 8.0.4 |
| **Estilizado (UI)** | TailwindCSS / Lucide React | 3.4.1 / 1.8.0 |
| **Validación** | Zod (Paylod Hardening) | 4.3.6 |

---

## 3. Arquitectura del Sistema

### Organización del Código (`src/`)
*   `app/`: Rutas, páginas y Route Handlers (API). Utiliza el patrón **App Router**.
*   `components/`: UI Reutilizable dividida por dominios (Builder, Dashboard, Shared).
*   `lib/`: Lógica de negocio core (Prisma, Stripe, Auth, Validaciones).
*   `context/`: Proveedores de estado global para React.
*   `middleware.ts`: Capa de seguridad en el Edge para protección de rutas y validación de sesiones.

### Flujos Arquitectónicos
1.  **Autenticación**: Basada en JWT almacenado en cookies `httpOnly`. El `middleware.ts` intercepta cada petición a `/api/` y `/dashboard/` para validar la sesión antes de llegar al servidor.
2.  **Conexión de Servicios**:
    *   **Stripe**: Integración síncrona para Checkouts e asíncrona vía Webhooks para la activación de cursos y suscripciones.
    *   **IA**: Procesamiento de prompts en segundo plano con límites de cuota (Rate Limiting) gestionados en base de datos.
    *   **Storage**: Gestión de activos multimedia (thumbnails, PDFs) vía Supabase Storage / URLs externas.

---

## 4. Modelos de Base de Datos

Estructura relacional optimizada para integridad y auditoría:

### Dominios Principales
*   **Usuarios/Auth**: `User`, `Session`, `VerificationToken`, `PasswordResetToken`.
*   **Cursos**: `Course`, `CourseModule`, `CourseLesson`, `Quiz`, `QuizQuestion`, `QuizOption`.
*   **Pagos/Suscripciones**: `PlatformPlan`, `InstructorSubscription`, `Transaction`, `Coupon`, `CouponUsage`.
*   **Progreso/Aprendizaje**: `Enrollment`, `Progress`, `QuizAttempt`, `Certification`.
*   **Auditoría**: `AuditLog`, `StripeEventLog`, `DeletedUserLog`, `CourseDeletionLog`.

---

## 5. Funcionalidades por Rol

### [ADMIN] - El Panel de Control Maestro
*   **Gestión de Usuarios**: Creación manual, suspensión y aprobación de instructores.
*   **Moderación de Cursos**: Control total sobre el estado (Publicado, Hibernado, Archivado).
*   **Finanzas Globales**: Visualización de transacciones, comisiones de plataforma y retiros.
*   **Soporte Técnico**: Auditoría de logs de borrado y eventos de sistema.

### [INSTRUCTOR] - El Creador y Empresario
*   **Course Builder**: Editor enriquecido para lecciones, módulos y exámenes.
*   **Generador de IA**: Creación de estructuras de cursos completas a partir de prompts.
*   **Gestión de Ventas**: Creación de cupones, seguimiento de alumnos y balance de ingresos.
*   **Academy Profile**: Personalización de marca (logos, banners, slugs únicos).

### [STUDENT] - El Usuario Final
*   **Learning Experience**: Reproductor de lecciones, seguimiento de progreso automático.
*   **Evaluación**: Sistema de Quizzes con calificación inmediata.
*   **Logros**: Generación automática de certificados en PDF al aprobar evaluaciones finales.

---

## 6. Flujos Críticos de Negocio

1.  **Registro de Instructor**: Los instructores se registran y entran en estado `PENDING_APPROVAL`. Un administrador debe validar el perfil para permitir la publicación de cursos.
2.  **Checkout de Curso**: `student` -> Stripe Checkout -> Webhook -> `Enrollment` activo + `Transaction` registrada.
3.  **Certificación**: El sistema detecta cuando un alumno aprueba el último Quiz de un curso -> Genera `Certification` -> Envía PDF por email vía Resend.
4.  **Suscripción de Instructor**: Flujo recurrente gestionado por Stripe Billing que habilita límites de alumnos y uso de IA según el plan.

---

## 7. Modelo de Negocio

### Planes de Plataforma (`PlatformPlan`)
*   **Starter**: Límites básicos para nuevos creadores.
*   **Growth**: Aumenta límites de alumnos y activa IA.
*   **Scale**: Límites extendidos y soporte prioritario.
*   *Nota: Los precios y límites específicos son configurables dinámicamente en la base de datos.*

### Comisiones
La plataforma retiene un porcentaje de cada venta gestionada (`platformCommissionAmount`). Este porcentaje se define por plan (ej. 15%) y se calcula automáticamente en cada transacción exitosa.

---

## 8. Seguridad (Auditada v1.1)

Plattform implementa **11 capas de blindaje** estructural:
1.  **Role Armor**: Validación estricta de roles en cada Server Action.
2.  **Auth Loop Shield**: Protección contra redirecciones infinitas en el middleware.
3.  **JWT Hardening**: Secreto de sesión obligatorio y validación de firma en Edge.
4.  **Middleware API Guard**: Aislamiento total de `/api/*`.
5.  **IA Rate Limit**: Freno de emergencia (Prisma Guard) contra abuso de cuotas de OpenAI.
6.  **Webhook Idempotency**: Prevención de doble procesamiento de eventos de Stripe.
7.  **Dependency Hardening**: Parches de seguridad manuales en cadenas de suministro vulnerables.
8.  **Zod Strict Payload**: Rechazo automático de campos desconocidos en todas las peticiones POST/PATCH.
9.  **Course Locking**: Bloqueo de edición de contenido para cursos con alumnos activos.
10. **Security Headers**: HSTS, CSP (Report-Only), X-Frame-Options implementados en `next.config.js`.
11. **Audit Logging**: Registro detallado de borrados críticos y acciones administrativas.

---

## 9. Infraestructura y Despliegue

### Variables de Entorno Requeridas
*   `DATABASE_URL` / `DIRECT_URL` (PostgreSQL)
*   `NEXTAUTH_SECRET` (JWT Signing)
*   `OPENAI_API_KEY` (Generación de IA)
*   `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` (Pagos)
*   `RESEND_API_KEY` (Email transaccional)

### Configuración Core (`next.config.js`)
*   Eslint y TypeScript configurados para ignorar errores en build para permitir despliegues rápidos bajo supervisión.
*   Headers de seguridad centralizados.

---

## 10. Referencia de API (Resumen)

| Dominio | Ruta | Método | Rol | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | POST | Público | Inicio de sesión y set de cookies |
| **Admin** | `/api/admin/users` | POST/PATCH | ADMIN | Gestión de cuentas de usuario |
| **Admin** | `/api/admin/enrollments/manual` | POST | ADMIN | Inscripción manual de alumnos |
| **Instructor** | `/api/instructor/courses` | POST/PATCH | INSTRUCTOR | Builder de cursos y metadatos |
| **Instructor** | `/api/instructor/finance/withdraw` | POST | INSTRUCTOR | Solicitud de retiro de fondos |
| **Student** | `/api/student/progress` | POST | STUDENT | Registro de lección completada |
| **IA** | `/api/ai/generate-course` | POST | INSTRUCTOR | Generación de estructura vía GPT-4o |

---

## 11. Deuda Técnica y Roadmap

*   **Pendiente**: Implementación de Row Level Security (RLS) en la capa de base de datos (actualmente la seguridad reside en la capa de aplicación/Prisma).
*   **Pendiente**: Soporte para videos alojados localmente (actualmente requiere URL externa).
*   **Bugs**: Ver `PENDING_BUGS.md` para detalles sobre colisiones menores ya mitigadas pero que requieren refactorización estética.

---

## 12. Métricas del Código

*   **Archivos TypeScript (`src/`)**: 202
*   **Endpoints de API**: 69
*   **Modelos de Prisma**: 31
*   **Páginas del Dashboard**: 46

---
**Documento generado por**: Antigravity AI (Google Deepmind)
**Última actualización**: 25 de Abril de 2026
