import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  console.log('--- Buscando duplicados en QuizAttempt ---');
  const duplicates = await prisma.quizAttempt.groupBy({
    by: ['userId', 'quizId'],
    _count: { userId: true },
    having: { userId: { _count: { gt: 1 } } }
  });

  console.log(`Se encontraron ${duplicates.length} pares (user, quiz) con duplicados.`);

  for (const dup of duplicates) {
    const { userId, quizId } = dup;
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { attemptNumber: 'desc' }
    });

    // Mantener solo el último (mayor attemptNumber)
    const [keep, ...remove] = attempts;
    console.log(`Manteniendo intento ${keep.id} para User:${userId} Quiz:${quizId}. Borrando ${remove.length} anteriores.`);
    
    await prisma.quizAttempt.deleteMany({
      where: { id: { in: remove.map(r => r.id) } }
    });
  }
}

clean().finally(() => prisma.$disconnect());
