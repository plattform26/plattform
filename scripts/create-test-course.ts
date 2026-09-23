import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const instructor = await prisma.user.findUnique({
    where: { email: 'test.instructor@plattform.mx' }
  })
  if (!instructor) throw new Error('Instructor no encontrado')

  const course = await prisma.course.create({
    data: {
      instructorId: instructor.id,
      title: 'Curso de Prueba — Builder',
      slug: 'curso-prueba-builder',
      description: 'Curso para probar el builder con quizzes por módulo',
      category: 'TECH_INNOVATION',
      level: 'BEGINNER',
      price: 299,
      status: 'DRAFT',
      visibility: 'PUBLIC',
    }
  })

  const modulo1 = await prisma.courseModule.create({
    data: { courseId: course.id, title: 'Módulo 1: Introducción', orderIndex: 1 }
  })

  const modulo2 = await prisma.courseModule.create({
    data: { courseId: course.id, title: 'Módulo 2: Fundamentos', orderIndex: 2 }
  })

  await prisma.courseLesson.createMany({
    data: [
      { courseId: course.id, moduleId: modulo1.id, title: 'Lección 1.1', subtitle: 'Primera lección', contentText: '<p>Contenido de prueba</p>', contentType: 'TEXT', orderIndex: 1, durationMinutes: 10 },
      { courseId: course.id, moduleId: modulo1.id, title: 'Lección 1.2', subtitle: 'Segunda lección', contentText: '<p>Contenido de prueba</p>', contentType: 'TEXT', orderIndex: 2, durationMinutes: 10 },
      { courseId: course.id, moduleId: modulo2.id, title: 'Lección 2.1', subtitle: 'Tercera lección', contentText: '<p>Contenido de prueba</p>', contentType: 'TEXT', orderIndex: 1, durationMinutes: 10 },
    ]
  })

  console.log('✅ Curso de prueba creado:', course.id)
  console.log('   Módulo 1 creado:', modulo1.id)
  console.log('   Módulo 2 creado:', modulo2.id)
  console.log('   3 lecciones creadas')
  console.log('\n👉 URL del builder en staging:')
  console.log(`   /dashboard/instructor/courses/${course.id}/builder`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
