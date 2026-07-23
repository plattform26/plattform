import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courseId = 'bb1c051c-f46c-44bf-8bda-2df5727f9562';
  try {
    const deleted = await prisma.course.delete({
      where: { id: courseId }
    });
    console.log('Curso eliminado con éxito:', deleted.title);
  } catch (error) {
    console.error('Error al eliminar curso:', error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
