import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Auditing Orphaned Quizzes Platform-wide\n');

  // Query 1: Total and Orphaned Stats
  const totalQuizzes = await prisma.quiz.count();
  const orphanedQuizzesCount = await prisma.quiz.count({
    where: { lessonId: null }
  });
  const okQuizzesCount = totalQuizzes - orphanedQuizzesCount;
  const percentageOrphaned = totalQuizzes > 0 ? (orphanedQuizzesCount / totalQuizzes * 100).toFixed(2) : '0.00';

  console.log('--- GENERAL STATS ---');
  console.log(`Total Quizzes: ${totalQuizzes}`);
  console.log(`Orphaned Quizzes: ${orphanedQuizzesCount}`);
  console.log(`OK Quizzes: ${okQuizzesCount}`);
  console.log(`Percentage Orphaned: ${percentageOrphaned}%`);

  // Query 2: List Orphaned Quizzes
  const orphanedQuizzes = await prisma.quiz.findMany({
    where: { lessonId: null },
    include: {
      course: {
        select: { title: true, id: true, aiGenerated: true }
      }
    },
    orderBy: { course: { title: 'asc' } }
  });

  console.log('\n--- ORPHANED QUIZZES LIST ---');
  orphanedQuizzes.forEach(q => {
    console.log(`Quiz ID: ${q.id} | Title: ${q.title} | Course: ${q.course.title} (ID: ${q.course.id}) | AI Generated: ${q.course.aiGenerated}`);
  });

  // Query 3: Affected Courses
  const affectedCoursesMap = new Map<string, { title: string, total: number, orphaned: number }>();
  
  // To get total quizzes per course for affected courses
  const quizzesByCourse = await prisma.quiz.groupBy({
    by: ['courseId'],
    _count: { id: true }
  });

  const orphanedByCourse = await prisma.quiz.groupBy({
    by: ['courseId'],
    where: { lessonId: null },
    _count: { id: true }
  });

  const courseIds = [...new Set([...quizzesByCourse.map(q => q.courseId), ...orphanedByCourse.map(q => q.courseId)])];
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, title: true }
  });

  const courseTitles = new Map(courses.map(c => [c.id, c.title]));

  console.log('\n--- AFFECTED COURSES SUMMARY ---');
  orphanedByCourse.forEach(o => {
    const total = quizzesByCourse.find(q => q.courseId === o.courseId)?._count.id || 0;
    console.log(`Course: ${courseTitles.get(o.courseId)} (ID: ${o.courseId}) | Total Quizzes: ${total} | Orphaned: ${o._count.id}`);
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
