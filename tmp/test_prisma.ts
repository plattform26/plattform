import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
    
    console.log(`Total Quizzes found: ${quizzes.length}`);
    for (const quiz of quizzes) {
      console.log(`- ${quiz.title} (ID: ${quiz.id}) [Questions: ${quiz._count.questions}]`);
    }
    
    // Also try to find one with options
    const quizWithOpts = await prisma.quiz.findFirst({
      where: {
        questions: {
          some: {
            options: {
              some: {}
            }
          }
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (quizWithOpts) {
      console.log(`\nDetailed look at Quiz with Options: ${quizWithOpts.title}`);
      quizWithOpts.questions.forEach((q, i) => {
        console.log(`Q${i+1}: ${q.questionText} (${q.options.length} options)`);
        q.options.forEach(o => {
          console.log(`  - [${o.isCorrect ? 'X' : ' '}] ${o.optionText}`);
        });
      });
    } else {
      console.log('\nNo quizzes found with associated QuizOptions in the database!');
    }

  } catch (error) {
    console.error('Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
