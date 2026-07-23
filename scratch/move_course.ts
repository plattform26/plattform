import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targetEmail = 'soporte@plattform.mx';
  const courseId = 'c7c5e365-7cc8-4e4c-b18c-1642d6bd9b2b';

  console.log(`Buscando usuario destino: ${targetEmail}...`);
  const targetUser = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (!targetUser) {
    console.error(`Error: No se encontró al usuario con el email "${targetEmail}" en la base de datos.`);
    process.exit(1);
  }

  console.log(`Usuario encontrado. ID: ${targetUser.id} | Rol: ${targetUser.role}`);
  console.log(`Transfiriendo curso ID: ${courseId} a ${targetEmail}...`);

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: {
      instructorId: targetUser.id
    }
  });

  console.log(`\n🎉 ¡Curso transferido con éxito!`);
  console.log(`El curso "${updatedCourse.title}" ahora pertenece al instructor con email: ${targetEmail}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
