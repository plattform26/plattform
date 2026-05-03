import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email = 'azulno26@hotmail.com';
const courseTitle = 'Curso Prueba: Explorando Conceptos Clave de la Unidad 2';

async function main() {
  console.log('Auditing Hibernated Course Bug\n');

  // 1. Find User
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error('User not found.');
    return;
  }

  // 2. Find Course
  const course = await prisma.course.findFirst({
    where: { title: { contains: 'Curso Prueba' } }
  });

  if (!course) {
    console.error('Course not found.');
    return;
  }

  console.log(`Course: ${course.title} (ID: ${course.id})`);
  console.log(`Status: ${course.status}`);
  
  // 3. Find Enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { 
      userId_courseId: { 
        userId: user.id, 
        courseId: course.id 
      } 
    }
  });

  if (!enrollment) {
    console.log('No enrollment found for this user and course.');
  } else {
    console.log(`Enrollment Status: ${enrollment.status}`);
    console.log(`Enrolled At: ${enrollment.enrolledAt}`);
  }

  // 4. Check Progress
  const completedLessons = await prisma.progress.count({
    where: { userId: user.id, courseId: course.id, completed: true }
  });
  const totalLessons = await prisma.courseLesson.count({
    where: { courseId: course.id }
  });

  console.log(`Progress: ${completedLessons}/${totalLessons} lessons completed`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
