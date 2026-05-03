# Validación de Cambios - Instructor Preview (ANÁLISIS SOLO)

Fecha: 2026-05-03
Objetivo: Validar que cambios en rutas instructor NO afecten sistema de estudiante

## 1. Mapeo de Componentes

### 1.1 Componentes de Student
| Archivo | Importa | APIs Llamadas | Crítico |
|---------|---------|---------------|---------|
| LessonClient.tsx | useCourseProgress, useRouter | POST /api/student/progress | SÍ |
| SidebarClient.tsx | CourseProgressProvider | (Inyecta Contexto) | SÍ |
| QuizViewer.tsx | CertificateDownloader, RatingModal | POST /api/student/quiz/[id]/attempt | SÍ |
| [id]/lesson/[lessonId]/page.tsx | LessonClient, QuizViewer | DB (Prisma Direct) | SÍ |
| [id]/layout.tsx | SidebarClient | DB (Prisma Direct) | SÍ |

### 1.2 Componentes de Instructor Existentes
| Archivo | Importa | ¿De Student? | APIs Llamadas |
|---------|---------|--------------|---------------|
| preview/page.tsx | Link, prisma, getSession | NO | DB (Prisma Direct) |
| preview/lesson/[lessonId]/page.tsx | InlineLessonEditor | NO | DB (Prisma Direct) |
| InlineLessonEditor.tsx | BuilderRichEditor, sanitizePayload | NO | PATCH /api/lessons/[id] |

### 1.3 Conclusión
- ¿Hay imports cruzados? **NO**. Las rutas de instructor son actualmente independientes de los componentes de estudiante.
- Si hay, ¿son problemáticos? N/A.
- Riesgo: **BAJO** (Estructuralmente están aislados, lo cual facilita la implementación sin romper lo existente).

---

## 2. Análisis de APIs

### 2.1 APIs de Student
| Endpoint | Ubicación | ¿Qué Modifica? | Auth |
|----------|-----------|----------------|------|
| /api/student/progress | src/app/api/student/progress/route.ts | Tabla `Progress`, `Enrollment`, `Certification` | Permite STUDENT, ADMIN, INSTRUCTOR |
| /api/student/quiz/[id]/attempt | src/app/api/student/quiz/[id]/attempt/route.ts | Tabla `QuizAttempt`, `Certification` | Permite STUDENT, ADMIN |

### 2.2 APIs de Instructor
| Endpoint | Ubicación | ¿Qué Modifica? | ¿Es igual a Student? |
|----------|-----------|----------------|----------------------|
| /api/lessons/[id] | src/app/api/lessons/[id]/route.ts | Tabla `CourseLesson` (Metadata) | NO (Es de edición) |
| /api/instructor/profile | src/app/api/instructor/profile/route.ts | Tabla `InstructorProfile` | NO |

### 2.3 Riesgo Identificado
- ¿Instructor podría llamar APIs de student? **SÍ**. Específicamente `/api/student/progress` está programado para permitir el rol `INSTRUCTOR` si es dueño del curso.
- ¿Hay protecciones? Sí, el API valida que el instructor sea el dueño del curso o esté inscrito.
- Riesgo: **MEDIO**. Si se copia el componente `LessonClient` sin un prop `isPreview`, el instructor generará registros de progreso reales en la base de datos para su propio usuario.

---

## 3. Análisis de Base de Datos

### 3.1 Tablas Críticas
| Tabla | RLS | ¿Quién escribe? | Triggers |
|-------|-----|-----------------|----------|
| progress | Desconocido* | student, admin, instructor | No detectados en migraciones |
| quiz_attempts | Desconocido* | student, admin | No detectados en migraciones |
| certifications | Desconocido* | API (automático) | No detectados en migraciones |

*\*Nota: El acceso se controla a nivel de API (Next.js Route Handlers), no se encontró configuración explícita de RLS en el código del repositorio.*

### 3.2 Impacto Potencial
Si instructor accede a API de student:
- Se escribiría en: `progress`, `certifications` (si completa el 100%).
- Causaría conflicto: **NO** (Los registros son por `userId`, no afectan a otros alumnos).
- Trigger se dispararía: Desconocido (pero el código de la API dispara envíos de emails).

Riesgo: **MEDIO** (Basura en DB y correos accidentales al instructor).

---

## 4. Análisis de Seguridad

### 4.1 Autenticación
- ¿Rutas instructor protegidas? **SÍ**. `src/middleware.ts` y verificaciones manuales de `role === 'INSTRUCTOR'`.
- ¿Validación de courseId? **SÍ**. Las APIs verifican `instructorId` contra el `userId` de la sesión.
- Riesgo: **BAJO**.

### 4.2 RLS en Supabase
- studentProgress RLS: No documentado en código, se asume manejo por API.
- ¿Protege contra instructor? La API `/api/student/progress` **permite** explícitamente al instructor escribir.
- Riesgo: **BAJO** (Es un comportamiento permitido por diseño, pero debe controlarse en el frontend).

---

## 5. Validación de Seguridad - Preguntas Críticas

❓ ¿Si copiamos estructura de student en instructor, podría accidentalmente llamar APIs de student?
   Respuesta: **SÍ**. Si se reutiliza `LessonClient.tsx` tal cual, el evento `onClick` llamará a `/api/student/progress`.
   Evidencia: `src/app/dashboard/student/learn/[id]/lesson/[lessonId]/LessonClient.tsx:36`.

❓ ¿Hay protecciones que eviten que instructor contamine tablas de studentProgress?
   Respuesta: **PARCIALMENTE**. El API lo permite, pero la lógica de negocio restringe que solo sea para "su" curso. No evita la creación del registro "basura" del instructor.
   Evidencia: `src/app/api/student/progress/route.ts:103`.

❓ ¿El RLS de Supabase previene writes de instructor en tablas de student?
   Respuesta: **NO**. El sistema confía en la lógica de Prisma y las Route Handlers de Next.js, las cuales permiten el acceso según el rol.

---

## 6. Conclusión Final

### Veredicto
🟡 **PRECAUCIÓN**

Razones:
- El API de progreso de estudiante permite explícitamente el acceso a instructores.
- La reutilización directa de componentes de cliente (`LessonClient`) provocará llamadas a producción en modo preview.
- La infraestructura es segura (no hay riesgo de acceso a datos ajenos), pero hay riesgo de generación de datos inconsistentes (instructores con progreso).

### Recomendaciones
1. **Prop `isPreview`**: Todos los componentes de estudiante reutilizados deben recibir un prop `isPreview`. Si es `true`, deben desactivar las llamadas a `fetch` o redirigirlas a un modo de simulación.
2. **Endpoint de Mock**: Considerar un endpoint o flag en el API para ignorar escrituras cuando el header `X-Preview-Mode` esté presente.
3. **Sidebar Reusable**: El `SidebarClient` puede reutilizarse sin problemas ya que es principalmente de lectura.

### Próximos Pasos
- Proceder con la implementación de la alineación visual, asegurando que el prop `isPreview` esté presente en cada integración.
- Refactorizar `LessonClient` para que el botón de "Completada" sea inerte o puramente visual en modo instructor.
