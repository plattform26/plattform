import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'azulno26@hotmail.com' } });
  if (!user) return;

  const lastProgress = await prisma.progress.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { lesson: { select: { title: true } } }
  });

  console.log('Last progress recorded:');
  console.dir(lastProgress, { depth: null });

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: lastProgress?.courseId || '' } }
  });
  console.log('Enrollment status for this course:');
  console.dir(enrollment, { depth: null });

  await prisma.$disconnect();
}

main();
