const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function nuclearCourseCleanup() {
  console.log('☢️  Iniciando Limpieza Nuclear del Catálogo de Cursos...\n');

  try {
    // 1. Identificar todos los cursos para reporte
    const courses = await prisma.course.findMany({
      select: { id: true, title: true }
    });
    console.log(`📊 Cursos encontrados en catálogo: ${courses.length}`);

    if (courses.length === 0) {
      console.log('ℹ️  No hay cursos en el catálogo. Misión abortada por falta de objetivos.');
      return;
    }

    // Listado de cursos específicos para reporte
    const targetTitles = [
      'Masterclass: Arquitectura SaaS con Next.js',
      'Finanzas Personales e Inversión desde Cero',
      'Introducción al Uso de Claude — IA Práctica',
      'Estrategia Empresarial en la Era Digital'
    ];

    console.log('\n--- Destruyendo dependencias manuales ---');

    // 2. Borrar AdminManualEnrollment (No tiene cascade en el schema)
    const delManualEnrollments = await prisma.adminManualEnrollment.deleteMany({});
    console.log(`✅ Inscripciones manuales de administrador eliminadas: ${delManualEnrollments.count}`);

    // 3. Borrar AIGenerationJob vinculados a cursos
    const delAIJobs = await prisma.aIGenerationJob.deleteMany({});
    console.log(`✅ Trabajos de IA eliminados: ${delAIJobs.count}`);

    console.log('\n--- Ejecutando eliminación masiva de cursos ---');

    // 4. Borrar todos los cursos (Cascada manejará Modules, Lessons, Enrollments, Ratings, etc.)
    const delCourses = await prisma.course.deleteMany({});
    console.log(`💥 Total de cursos eliminados: ${delCourses.count}`);

    // Reporte de los específicos
    console.log('\n--- Reporte de Objetivos Prioritarios ---');
    targetTitles.forEach(title => {
      const found = courses.some(c => c.title.toLowerCase().includes(title.toLowerCase()));
      if (found) {
        console.log(`✅ [ELIMINADO]: ${title}`);
      } else {
        console.log(`ℹ️  [NO ENCONTRADO/YA ELIMINADO]: ${title}`);
      }
    });

    // 5. Verificación final
    console.log('\n🔍 Verificación final de integridad...');
    const courseCount = await prisma.course.count();
    const moduleCount = await prisma.courseModule.count();
    const lessonCount = await prisma.courseLesson.count();
    const enrollmentCount = await prisma.enrollment.count();

    console.log(`   - Cursos: ${courseCount}`);
    console.log(`   - Módulos: ${moduleCount}`);
    console.log(`   - Lecciones: ${lessonCount}`);
    console.log(`   - Inscripciones: ${enrollmentCount}`);

    if (courseCount === 0) {
      console.log('\n✨ Misión cumplida. El catálogo está 100% vacío.');
    } else {
      console.warn('\n⚠️  La misión falló parcialmente. Aún quedan registros.');
    }

  } catch (error) {
    console.error('\n💥 Error crítico durante la detonación:', error);
  }
}

nuclearCourseCleanup()
  .catch((e) => {
    console.error('💥 Error fatal en el script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
