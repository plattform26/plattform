import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const courseId = 'c50526a8-4494-4850-896d-368ff1a6170d';

async function main() {
  console.log(`Auditing course: ${courseId}\n`);

  // Query 1: List all modules
  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    orderBy: { orderIndex: 'asc' },
    include: { _count: { select: { lessons: true } } }
  });

  console.log('--- MODULES ---');
  modules.forEach(m => {
    console.log(`ID: ${m.id} | Title: ${m.title} | Order: ${m.orderIndex} | Lessons: ${m._count.lessons}`);
  });

  // Query 2: List all lessons
  const lessons = await prisma.courseLesson.findMany({
    where: { courseId },
    include: { module: true },
    orderBy: [
      { module: { orderIndex: 'asc' } },
      { orderIndex: 'asc' }
    ]
  });

  console.log('\n--- LESSONS ---');
  lessons.forEach(l => {
    const hasContent = !!l.contentText && l.contentText.trim().length > 0;
    const hasVideo = !!l.videoUrl && l.videoUrl.trim().length > 0;
    console.log(`ID: ${l.id} | Title: ${l.title} | Module: ${l.module?.title || 'N/A'} | Order: ${l.orderIndex} | Content: ${hasContent ? 'YES' : 'NO'} | Video: ${hasVideo ? 'YES' : 'NO'}`);
  });

  // Query 3: Lessons by Module (already covered by modules include, but let's be explicit)
  console.log('\n--- LESSON COUNT BY MODULE ---');
  modules.forEach(m => {
    console.log(`${m.title}: ${m._count.lessons} lessons`);
  });

  // Query 4: Potential Phantom Lessons
  console.log('\n--- POTENTIAL PHANTOM LESSONS ---');
  lessons.forEach(l => {
    const hasContent = !!l.contentText && l.contentText.trim().length > 0;
    const hasVideo = !!l.videoUrl && l.videoUrl.trim().length > 0;
    if (!hasContent && !hasVideo) {
       console.log(`PHANTOM DETECTED: ID: ${l.id} | Title: ${l.title} | Reason: No content and no video`);
    }
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
