const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Inyección de Emergencia ---');

  const alejandro = await prisma.user.findUnique({ where: { email: 'alejandro@plattform.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@plattform.com' } });

  if (!alejandro || !admin) {
    console.error('Usuarios Alejandro o Admin no encontrados. Ejecuta el seed principal primero.');
    return;
  }

  const courses = [
    {
      instructorId: alejandro.id,
      title: 'Estrategia Empresarial (Emergencia)',
      slug: 'estrategia-emergencia-' + Date.now(),
      description: 'Curso inyectado para estabilización.',
      category: 'BUSINESS',
      price: 1500,
      status: 'PUBLISHED',
      visibility: 'PUBLIC'
    },
    {
      instructorId: admin.id,
      title: 'Curso Maestro Admin (Emergencia)',
      slug: 'admin-emergencia-' + Date.now(),
      description: 'Curso inyectado para pruebas del administrador.',
      category: 'TECHNOLOGY',
      price: 2500,
      status: 'PUBLISHED',
      visibility: 'PUBLIC'
    }
  ];

  for (const c of courses) {
    const created = await prisma.course.create({ data: c });
    console.log(`Curso creado: ${created.title} (ID: ${created.id})`);
  }

  const student = await prisma.user.findUnique({ where: { email: 'alumno@plattform.com' } });
  if (student) {
      const course = await prisma.course.findFirst();
      if (course) {
          await prisma.enrollment.upsert({
              where: { userId_courseId: { userId: student.id, courseId: course.id } },
              update: { status: 'ACTIVE' },
              create: { userId: student.id, courseId: course.id, status: 'ACTIVE' }
          });
          console.log(`Alumno inscrito en ${course.title}`);
      }
  }

  console.log('--- Inyección de Emergencia Finalizada ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
