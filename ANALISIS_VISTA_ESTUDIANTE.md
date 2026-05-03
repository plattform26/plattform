# Análisis Comparativo: Vista Estudiante vs Preview Instructor

Este documento detalla las diferencias estructurales, de componentes y de estilo entre la experiencia de aprendizaje del estudiante y la previsualización del instructor.

## 1. Estructura de Archivos

### Vista Estudiante
- **Página Principal:** `src/app/dashboard/student/learn/[id]/lesson/[lessonId]/page.tsx`
- **Layout:** `src/app/dashboard/student/learn/[id]/layout.tsx` (Provee la estructura de Sidebar + Topbar).
- **Componentes Usados:**
  - `SidebarClient.tsx` (Navegación lateral y progreso).
  - `LessonClient.tsx` (Navegación inferior y marcado de completado).
  - `QuizViewer.tsx` (Renderizado de evaluaciones).

### Preview Instructor
- **Temario (Preview):** `src/app/dashboard/instructor/courses/[id]/preview/page.tsx`
- **Lección (Preview):** `src/app/dashboard/instructor/courses/[id]/preview/lesson/[lessonId]/page.tsx`
- **Layout:** Usa el layout general de instructor `src/app/dashboard/instructor/layout.tsx`.
- **Componentes Usados:**
  - `InlineLessonEditor.tsx` (Permite edición rápida en la vista de preview).
  - Links directos para navegación (no usa un componente de navegación dedicado como `LessonClient`).

---

## 2. Estructura de Layout (del código)

### Vista Estudiante
```tsx
<SidebarClient> {/* bg-[#050b16], w-[258px] */}
  <main> {/* bg-[#080e1c] */}
    <header> {/* Topbar con botón "Ocultar/Mostrar Temario" */}
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header> {/* Título de lección, Tag de módulo */}
      <div className="space-y-12">
        {/* Video (iframe) */}
        <section className="card prose-invert"> {/* Contenido Texto/Quiz */}
        <div className="did-you-know"> {/* Puntos clave */}
      </div>
      <LessonClient /> {/* Navegación inferior: Anterior, Siguiente, Completar */}
    </div>
  </main>
</SidebarClient>
```

### Preview Instructor (Lección)
```tsx
<div className="min-h-screen bg-[#070d1a]">
  <header className="h-16 flex border-b border-green-500/20"> {/* Header fijo con "Volver al Temario" */}
  <main className="max-w-5xl mx-auto px-6 py-12">
    {/* Contenedor de Video (Placeholder/Editor) */}
    {/* Contenedor de Texto (Card con hover effect para editar) */}
    {/* Placeholder de Quiz (Deshabilitado) */}
    <div className="mt-20 flex justify-between"> {/* Navegación manual con Links */}
    <InlineLessonEditor />
  </main>
</div>
```

### Diferencias Clave
1. **Sidebar:** La vista de estudiante tiene un Sidebar persistente con el temario y progreso. La vista de instructor es una página completa (Full Width) que requiere volver atrás para ver el temario.
2. **Interactividad:** La vista de estudiante permite marcar lecciones como completadas y realizar quizzes reales. La vista de instructor tiene placeholders de edición y los quizzes están deshabilitados.
3. **Navegación Superior:** El estudiante tiene un botón para colapsar el sidebar; el instructor tiene un banner de "MODO PREVIEW" y un link de retorno.

---

## 3. Componentes Importados

### Vista Estudiante
- `LessonClient` (`./LessonClient`): Maneja estados de navegación y progreso.
- `QuizViewer` (`./QuizViewer`): Componente complejo para exámenes.
- `SidebarClient` (`../SidebarClient`): Envuelve toda la experiencia de aprendizaje.

### Preview Instructor
- `InlineLessonEditor` (`@/components/InlineLessonEditor`): Específico para que el instructor edite sin salir de la vista.
- Sin componentes de navegación específicos (usa `<Link />` estándar).

### Componentes que se Reutilizan
- No se detecta una reutilización directa de los componentes principales (`LessonClient` o `QuizViewer`) en la vista de instructor, lo que genera la divergencia visual.
- Ambos usan clases de `globals.css` como `.card`, `.module-tag` y `.video-container`.

---

## 4. Estilos y Clases CSS

### Vista Estudiante
- **Fondo:** `bg-[#080e1c]` (Casi negro/azul profundo).
- **Acentos:** `text-cyan-400`, `bg-cyan-500`.
- **Tipografía:** `font-space-grotesk` para títulos, `italic` para subtítulos.
- **Clases Principales:** `card`, `video-container`, `module-tag`.

### Preview Instructor
- **Fondo:** `bg-[#070d1a]` (Similar, pero ligeramente más oscuro).
- **Acentos:** `text-green-400` / `bg-green-500` (para el tag de Preview), `text-cyan-400` para hovers.
- **Clases Principales:** `prose prose-invert prose-blue`, `rounded-3xl`, `shadow-2xl`.

---

## 5. Recomendaciones para Alineación Visual

| Recomendación | Razón | Prioridad |
| :--- | :--- | :--- |
| **Implementar Sidebar en Preview** | Para que el instructor vea exactamente cómo se distribuye el espacio con el Sidebar abierto/cerrado. | **Alta** |
| **Unificar Lesson Header** | El header de la lección en estudiante es más estilizado (título gigante, separador cian) que el de instructor. | **Media** |
| **Sustituir Placeholders por Componentes Reales** | Usar `QuizViewer` en modo "solo lectura" en lugar de un banner morado estático. | **Baja** |
| **Estandarizar Navegación Inferior** | Reutilizar `LessonClient` en modo `isPreview` para que los botones se vean idénticos. | **Media** |

---

## 6. Archivos a Modificar (Siguientes Pasos)

1. `src/app/dashboard/instructor/courses/[id]/preview/lesson/[lessonId]/page.tsx`: Reestructurar para incluir el `SidebarClient` o un componente similar que emule el layout de estudiante.
2. `src/app/dashboard/student/learn/[id]/lesson/[lessonId]/LessonClient.tsx`: Ajustar para aceptar un prop `isPreview` que deshabilite la lógica de fetch a `/api/student/progress`.
3. `src/app/dashboard/student/learn/[id]/SidebarClient.tsx`: Asegurar que el componente sea lo suficientemente genérico para usarse en la ruta de instructor.
