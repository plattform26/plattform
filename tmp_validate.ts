import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function simulate() {
  const quizId = '7058ad5d-e9a8-4c17-a438-51338fed8c49'; // Estrategia Quiz
  const courseId = '24266a18-170c-4492-8bf0-d5a7733e7da5';
  
  // Mock answers map (Question UUID -> Option UUID)
  const answers = {
    "8587f87d-2291-4b76-af98-4fa3f1b07635": "ee449609-8aee-4e08-95fc-a64dee92be2b", // Correcto "3"
    "bbdb7c6e-6908-4f24-b12c-8f010641a6a2": "bd4bb527-8b6e-4493-b331-6a55e1f028df"  // Correcto "e"
  };

  console.log('--- SIMULANDO CALIFICACIÓN ---');
  
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { options: true } } }
  });

  if (!quiz) throw new Error('Quiz not found');

  let totalPoints = 0;
  let earnedPoints = 0;

  const results = quiz.questions.map((q: any) => {
    const userAnswerId = answers[q.id as keyof typeof answers];
    const qPoints = q.points || 1;
    totalPoints += qPoints;

    const relationalCorrect = q.options.find((opt: any) => opt.isCorrect);
    let correctAnswerId = relationalCorrect?.id;

    if (!correctAnswerId) {
        const legacyIndex = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;
        const targetOrder = (parseInt(legacyIndex as string) || 0) + 1;
        const legacyCorrect = q.options.find((opt: any) => opt.orderIndex === targetOrder);
        correctAnswerId = legacyCorrect?.id;
    }

    const isCorrect = userAnswerId === correctAnswerId && !!userAnswerId;
    if (isCorrect) earnedPoints += qPoints;

    return {
      q: q.questionText,
      userAnswerId,
      correctAnswerId,
      isCorrect,
      points: isCorrect ? qPoints : 0
    };
  });

  const scorePercentage = (earnedPoints / totalPoints) * 100;
  const passed = scorePercentage >= quiz.passingScore;

  console.table(results);
  console.log(`PUNTOS TOTALES: ${totalPoints}`);
  console.log(`PUNTOS GANADOS: ${earnedPoints}`);
  console.log(`PORCENTAJE: ${scorePercentage}%`);
  console.log(`APROBADO: ${passed}`);
  
  if (scorePercentage !== 100) {
    throw new Error(`TEST FAILED: Score should be 100%, but got ${scorePercentage}%`);
  }
  console.log('--- VALIDACIÓN EXITOSA ---');
}

simulate()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
